import { RequestHandler } from "express";
import { ExpressError } from "../utils/ErrorHandler";
import * as bcrypt from 'bcrypt'
import { generateAccessToken} from "../utils/middlewares/auth";
import { User } from "../entity/User";
import { Movie } from "../entity/Movies";
import { Actor } from "../entity/Actors";
import { validate } from "class-validator";


//home get controller
export const renderHome:RequestHandler = (req, res) => {
  res.status(200).render('home')
}


//home get controller
export const renderGoogle: RequestHandler = (req, res) => {
  res.status(200).render('users/google')
}

//register get controller
export const renderRegister: RequestHandler = async (req, res) => {
    return res.status(200).render('users/register')
}

//register post controller
//right now, a simple validation on client side /client/public/validation.js and on model side are used. 
//will add more validations using regex or a third party package.
export const register: RequestHandler = async (req, res) => {
  //destructure info from request.body
  const {email, password } = req.body;
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    req.flash('error', 'Username or Email already registered!')
    return res.status(400).redirect('/register')
  }
  try {
    //hash the given password using bcrypt.
    const hashedPassword = await bcrypt.hash(password, 10)
    //get User entity and create a new User entity using the given information.
    const user  = User.create({ email: email, password: hashedPassword })
    const errors = await validate(user);
    if (errors.length > 0) {
      throw new Error(`Validation failed!`);
    } else {
      await User.save(user);
    }
    //save the new User into database.
    //await getRepository(User).save(user)
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
  //get username&password from body then correct it with the registered userbase.
  const {email, password} = req.body
  const user = await User.findOne({ email: email })
  //if user doesnt exist in database, redirect.
  if (!user) {
    req.flash('error', 'User not found!')
    return res.status(400).redirect('/login')
  }
  try {
    //if user exists in database, then compare the given info with the one in db. in other words, check if the password is correct with bcrypt compare. 
    if (user.email === email && await bcrypt.compare(password, user.password)) {
      /* if (user.email === email && password === user.password) { */
      //after username & password correction, generate token for the user for specified minutes.
      const payload = {
        id: user.id,
        email: user.email
      };
      //generate jwt token.
   /*    const accessToken = generateJWT(payload) */
      const accessToken = generateAccessToken(payload)
      //jwt token generated and sent to client as cookie.
      res.cookie("jwt", accessToken); 
      //username added into session info for future controls.
      //session does not persist long term? passport jwt req.user has type issues on renderprofile etc. Check Again
      req.session.email = user.email;
      req.session.userid = user.id;
      req.flash('success', 'Successfully logged in!')
      return res.status(200).redirect(`/profile/${user.id}`) 

    } else {
      req.flash('error', 'Wrong username or password!')
      return res.status(400).redirect('/login')
    }
  } catch (e) {
    req.flash('error', 'Sorry, something went wrong while loggin in!')
    return res.status(500).redirect('/login')
  }
}

//user get controller
//redirect sends req.body info temporarily to /users get route
export const renderProfile: RequestHandler = async (req, res) => {
  const currentUser = await User.findOne(+req.headers.id)
  const movies = await Movie.find({where: {user: {id: req.headers.id}}})
  const actors = await Actor.find({where: {user: {id: req.headers.id}}})
  res.status(200).render('users/profile', {currentUser, movies, actors })
}


export const renderEdit: RequestHandler = async (req, res) => {
  const currentUser = await User.findOne({id: +req.headers.id});
  res.status(200).render('users/edit', {currentUser})
}

//logout controller
export const logout: RequestHandler = (req, res)  => {
  res.clearCookie('token');
  res.cookie("token", "", { maxAge: 1 });
  res.cookie("connect.sid", "", { maxAge: 1 });
  console.log('res.locals logout')
  console.log(res.locals)
  req.session.destroy((err) => {
    res.redirect('/') 
  })
}


export const updateUserInfo: RequestHandler = async (req, res) => {
  const { username,email, password } = req.body;
    try {
      const errorsUserInfo = await validate({ username, email, password });
      if (errorsUserInfo.length > 0) {
        throw new ExpressError(`Validation failed!`, 401);
      } 
      const hashedPassword = await bcrypt.hash(password, 10)
      await User.createQueryBuilder().update(User)
        .set({
          username: username,
          email: email,
          password: hashedPassword
        })
        .where('id = :id', { id: req.headers.id })
        .execute();
      const updatedUser = await User.findOne(+req.headers.id);
      //re-initialize jwt token
      const payload = {
        id: updatedUser.id,
        email: updatedUser.email
      };
      req.session.userid = req.headers.id;
      const newToken = generateAccessToken(payload)
      //jwt token generated and sent to client as cookie.
      res.cookie("token", newToken, { httpOnly: true, sameSite: "strict" });
      req.flash('success', 'Information updated.')
      return res.status(200).redirect(`/profile/${updatedUser.id}`)
    } catch (error) {
      req.flash('error', `Something went wrong. Maybe the email or username already in use - updateUser`)
      return res.status(500).redirect(`/profile/${+req.headers.id}`)
    }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
			await User.createQueryBuilder().delete().from(User).where('id = :id', { id: req.headers.id }).execute();
			req.session.email = null;
			req.session.userid = null;
			res.clearCookie('token');
			return res.status(200).redirect('/');
		} catch (error) {
      console.log(error);
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