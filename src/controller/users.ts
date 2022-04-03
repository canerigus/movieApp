import { RequestHandler } from "express";
import { ExpressError } from "../utils/ErrorHandler";
import * as bcrypt from 'bcrypt'
import { generateAccessToken} from "../utils/middlewares/auth";
import { User } from "../entity/User";
import { Movie } from "../entity/Movies";
import { Actor } from "../entity/Actors";
import { validate } from "class-validator";
import { check, validationResult } from "express-validator";


//home get controller
export const renderHome: RequestHandler = (req, res) => {
  res.status(200).render('home')
}

//register get controller
export const renderRegister: RequestHandler = async (req, res) => {
    return res.status(200).render('users/register')
}

//register post controller
//right now, a simple validation on client side /client/public/validation.js and on model side are used. 
//STRONG validation is not implemented for now easier testing. a simple password with one letter or an invalid email is enough to register.
export const register: RequestHandler = async (req, res) => {
  await check("email").isEmail().run(req);
  await check("password").isLength({ min: 6 }).run(req);
  const errors = validationResult(req);
  //if validation fails, flash an error.
  if (!errors.isEmpty()) {
    req.flash("error", 'Email or password validation failed');
    return res.redirect("/register");
  }  
  //destructure info from request.body
  const {email, password } = req.body;
  const existingEmail = await User.findOne({ email });
  //if email is registered before, flash an error.
  if (existingEmail) {
    req.flash('error', 'Email already registered!')
    return res.redirect('/register')
  }
  try {
    //hash the given password using bcrypt.
    const hashedPassword = await bcrypt.hash(password, 10)
    //initialize likes. This is needed for EJS templating purposes. likes array must not be empty.
    const likedmovies = ['initialize']
    const likedactors = ['initialize']
    //get User entity and create a new User entity using the given information.
    const user = User.create({ email: email, password: hashedPassword, likedmovies: likedmovies, likedactors: likedactors })
    //throw an error if validation fails. Only email structural validation is present right now.
    const errors = await validate(user);
    if (errors.length > 0) {
      throw new Error(`Validation DB failed!`);
    } else {
      //save the new User into database.
      await User.save(user);
    }
    req.flash('success', 'Successfully signed up!')
    return res.status(200).redirect('/login')
  } catch (e) {
    //catch if save throws an error.
    console.log(e)
    req.flash('error', 'Something went wrong! Validation failed!')
    return res.status(500).redirect('/register')
    }
}



//login get controller
export const renderLogin: RequestHandler = async (req, res) => {
	 res.status(200).render('users/login')
}

//login post controller
export const login: RequestHandler = async (req, res) => {
  await check("email").isEmail().run(req);
  await check("password").isLength({ min: 6 }).run(req);
  const errors = validationResult(req);
  //if validation fails, flash an error.
  if (!errors.isEmpty()) {
    req.flash("error", 'Wrong email or password');
    return res.redirect("/login");
  }  
  //get email&password from body then correct it with the registered userbase.
  const {email, password} = req.body
  const user = await User.findOne({ email: email })
  //if user doesnt exist in database, redirect.
  if (!user) {
    req.flash('error', 'User not found!')
    return res.redirect('/login')
  }
  try {
    //if user exists in database, then compare the given info with the one in db. in other words, check if the password is correct with bcrypt compare. 
    if (user.email === email && await bcrypt.compare(password, user.password)) {
      //after email & password correction, generate token for the user for specified minutes.
      const payload = {
        id: user.id,
        email: user.email
      };
      //generate jwt token.
      const accessToken = generateAccessToken(payload)
      //jwt token generated and sent to client as cookie.
      res.cookie("jwt", accessToken, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), httpOnly: true }); 
      //email added into session info for future controls.
      req.session.email = user.email;
      req.session.userid = user.id;
      req.flash('success', 'Successfully logged in!')
      return res.status(200).redirect(`/profile/${user.id}`) 

    } else {
      //flash an error if email or password is wrong.
      req.flash('error', 'Wrong email or password!')
      return res.status(400).redirect('/login')
    }
  } catch (e) {
    //flash an error if login failed.
    req.flash('error', 'Sorry, something went wrong while loggin in!')
    return res.status(500).redirect('/login')
  }
}

//renders profile.
export const renderProfile: RequestHandler = async (req, res) => {
  //get all movies, actors and user information and send to client for views.
  const currentUser = await User.findOne(+req.headers.id)
  const movies = await Movie.find({where: {user: {id: req.headers.id}}})
  const actors = await Actor.find({where: {user: {id: req.headers.id}}})
  res.status(200).render('users/profile', {currentUser, movies, actors })
}


//renders user account edit page.
export const renderEdit: RequestHandler = async (req, res) => {
  const currentUser = await User.findOne({id: +req.headers.id});
  res.status(200).render('users/edit', {currentUser})
}

//logout controller
export const logout: RequestHandler = (req, res) => {
  //clears the JWT authentication cookie and destroys the session.
  res.clearCookie('jwt');
  res.cookie("jwt", "", { maxAge: 1 });
  res.cookie("connect.sid", "", { maxAge: 1 });
  req.session.destroy((err) => {
    res.redirect('/') 
  })
}

 //updates the user information. 
export const updateUserInfo: RequestHandler = async (req, res) => {
  const userId = ""+req.headers.id
  await check("password").isLength({ min: 6 }).run(req);
  const errors = validationResult(req);
  //if validation fails, flash an error.
  if (!errors.isEmpty()) {
    req.flash("error", 'Password cannot be lower than 6 characters');
    return res.redirect(`/profile/${userId}`);
  }
  //get info from form
  const { username,email, password } = req.body;
  try {
      //validate given info by user. (email for now). if validation fails throw an error.
      const errorsUserInfo = await validate({ username, email, password });
      if (errorsUserInfo.length > 0) {
        throw new ExpressError(`Validation failed!`, 401);
    } 
    //hash the new password. and update user information.
      const hashedPassword = await bcrypt.hash(password, 10)
      await User.createQueryBuilder().update(User)
        .set({
          username: username,
          email: email,
          password: hashedPassword
        })
        .where('id = :id', { id: req.headers.id })
      .execute();
      //get the updatedUser info with id(which is not changed) then re-initialize jwt and session. 
      const updatedUser = await User.findOne(+req.headers.id);
      //re-initialize jwt token
      const payload = {
        id: updatedUser.id,
        email: updatedUser.email
      };
      req.session.userid = req.headers.id;
      const newToken = generateAccessToken(payload)
      //jwt token generated and sent to client as cookie.
      res.cookie("token", newToken, { httpOnly: true, sameSite: "strict", expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) });
      req.flash('success', 'Information updated.')
      return res.status(200).redirect(`/profile/${updatedUser.id}`)
  } catch (error) {
    //flash an error if updating user fails
    req.flash('error', `Something went wrong - updateUser`)
    return res.status(500).redirect(`/profile/${+req.headers.id}`)
  }
};

//delete the user.
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    //get delete the user with headers id and clear the session. Deleting user CASCADES on actors, movies and reviews.
    await User.createQueryBuilder().delete().from(User).where('id = :id', { id: req.headers.id }).execute();
    req.session.email = null;
    req.session.userid = null;
    res.clearCookie('token');
    return res.status(200).redirect('/');
		} catch (error) {
    console.log(error);
    //flash an error if deleting the user fails
    req.flash('error', `Sorry. Something went wrong. - Delete User`)
    return res.status(500).redirect(`/profile/${req.headers.id}`)
    }

};


//home get controller
export const renderTerms: RequestHandler = (req, res) => {
  res.status(200).render('policy/terms')
}

//home get controller
export const renderPrivacy: RequestHandler = (req, res) => {
  res.status(200).render('policy/privacy')
}