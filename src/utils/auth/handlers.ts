import { generateAccessToken } from "../../utils/middlewares/auth";
import { User } from '../../entity/User'
import express, { RequestHandler } from 'express';

export const googleLoginHandler: RequestHandler = async (req, res) => {
  req.session.currentUser = req.user
  const isUserExist = await User.findOne({ email: req.session.currentUser.emails[0].value })
  if (isUserExist) {
    const user = { id: isUserExist.id }
    req.session.userid = user.id
    res.locals.id = user.id
    res.locals.currentUser = req.session.currentUser.emails[0].value;
    const accessToken = generateAccessToken(user)
    res.cookie("jwt", accessToken); 
    return res.redirect(`/profile/${user.id}`);
  } else {
    const newUser = User.create({ email: req.session.currentUser.emails[0].value, googleID: req.session.currentUser.id })
    await User.save(newUser);
    req.session.userid = newUser.id
    res.locals.id = newUser.id
    res.locals.currentUser = req.session.currentUser.emails[0].value;
    const user = { id: newUser.id}
    const accessToken = generateAccessToken(user)
    res.cookie("jwt", accessToken); 
    return res.redirect(`/profile/${newUser.id}`);
}

}



export const facebookLoginHandler: RequestHandler = async (req, res) => {
req.session.currentUser = req.user
const isUserExist = await User.findOne({ facebookID: req.session.currentUser.id })

if (isUserExist) {
  const user = { id: isUserExist.id }
  req.session.userid = user.id
  res.locals.id = user.id
  res.locals.currentUser = req.session.currentUser.id;
  const accessToken = generateAccessToken(user)
  res.cookie("jwt", accessToken);
  return res.redirect(`/profile/${user.id}`);
} else {
  const newUser = User.create({ facebookID: req.session.currentUser.id })
  await User.save(newUser);
  req.session.userid = newUser.id
  res.locals.id = newUser.id
  res.locals.currentUser = req.session.currentUser.id;
  const user = { id: newUser.id }
  const accessToken = generateAccessToken(user)
  res.cookie("jwt", accessToken);
  return res.redirect(`/profile/${newUser.id}`);
}
}