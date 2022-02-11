import { generateAccessToken } from "../../utils/middlewares/auth";
import { User } from '../../entity/User'
import { RequestHandler } from 'express';


//googleLoginHandler works like a combination of login & register.
//if a user exist, generates a JWT token, sends it to cookie and redirects the user to profile page.
//if a user does not exist, create an User entity with the information supplied by google, generates a JWT token, sends it to cookie and redirects the user to profile page.
export const googleLoginHandler: RequestHandler = async (req, res) => {
  const isUserExist = await User.findOne({ email: req.session.passport.user.emails[0].value })
  if (isUserExist) {
    const user = { id: isUserExist.id }
    req.session.userid = user.id
    res.locals.id = user.id
    res.locals.currentUser = req.session.passport.user.value;
    const accessToken = generateAccessToken(user)
    res.cookie("jwt", accessToken, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), httpOnly: true }); 
    return res.redirect(`/profile/${user.id}`);
  } else {
    const likedmovies = ['initialize']
    const likedactors = ['initialize']
    const newUser = User.create({ email: req.session.passport.user.emails[0].value, googleID: req.session.passport.user.id, likedmovies: likedmovies, likedactors: likedactors })
    await User.save(newUser);
    req.session.userid = newUser.id
    res.locals.id = newUser.id
    res.locals.currentUser = req.session.passport.user.emails[0].value;
    const user = { id: newUser.id}
    const accessToken = generateAccessToken(user)
    res.cookie("jwt", accessToken, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), httpOnly: true }); 
    return res.redirect(`/profile/${newUser.id}`);
}

}


//facebookLoginHandler works like a combination of login & register.
//if a user exist, generates a JWT token, sends it to cookie and redirects the user to profile page.
//if a user does not exist, create an User entity with the information supplied by google, generates a JWT token, sends it to cookie and redirects the user to profile page.
export const facebookLoginHandler: RequestHandler = async (req, res) => {
  const isUserExist = await User.findOne({ facebookID: req.session.passport.user.id })
  if (isUserExist) {
    const user = { id: isUserExist.id }
    req.session.userid = user.id
    res.locals.id = user.id
    res.locals.currentUser = req.session.passport.user.id;
    const accessToken = generateAccessToken(user)
    res.cookie("jwt", accessToken, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), httpOnly: true });
    return res.redirect(`/profile/${user.id}`);
  } else {
    const likedmovies = ['initialize']
    const likedactors = ['initialize']
    const newUser = User.create({ facebookID: req.session.passport.user.id, likedmovies: likedmovies, likedactors: likedactors })
    await User.save(newUser);
    req.session.userid = newUser.id
    res.locals.id = newUser.id
    res.locals.currentUser = req.session.passport.user.id;
    const user = { id: newUser.id }
    const accessToken = generateAccessToken(user)
    res.cookie("jwt", accessToken);
    return res.redirect(`/profile/${newUser.id}`);
  }
}