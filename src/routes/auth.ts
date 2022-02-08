import { facebookLoginHandler, googleLoginHandler } from '../utils/auth/handlers'
import { Router } from 'express';
import * as express from 'express';
import passport from 'passport';

const router: Router = express.Router();

router.route('/auth/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }));

router.route('/auth/google/callback')
  .get(passport.authenticate('google', { failureRedirect: '/login' }), googleLoginHandler);


router.route('/auth/facebook')
  .get(passport.authenticate('facebook', { scope: 'email' } ));

router.route('/auth/facebook/callback')
  .get(passport.authenticate('facebook', { failureRedirect: '/login' }), facebookLoginHandler)


export default router;