import {
  renderHome, renderEdit, renderProfile, renderLogin,
  renderRegister, login, logout, register, updateUserInfo, deleteUser, renderTerms, renderPrivacy} from "../controller/users";
import { requireLogin, validateUser } from "../utils/middlewares/users";
import { authenticateToken } from "../utils/middlewares/auth";
import { Router } from 'express';
import * as express from 'express';

const router: Router = express.Router();

//home page
router.route('/')
  .get(renderHome)
//register routes
router.route('/register')
  .get(renderRegister)
  .post(register)

//login routes
router.route('/login')
  .get(renderLogin)
  .post(login)
  

//profile routes
router.route('/profile/:id')  
  .get(requireLogin, authenticateToken, validateUser,renderProfile)
  .put(requireLogin, authenticateToken, validateUser, updateUserInfo)
  .delete(requireLogin, authenticateToken, validateUser, deleteUser)

//edit profile
router.route('/profile/:id/edit')
  .get(requireLogin, authenticateToken, validateUser, renderEdit)

//logout
router.route('/logout')
  .get(logout)

//home page
router.route('/privacy')
  .get(renderPrivacy)

router.route('/terms')
  .get(renderTerms)

export default router;