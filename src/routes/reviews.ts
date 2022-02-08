import { createActorReview, createMovieReview, deleteActorReview, deleteMovieReview} from "../controller/reviews";
import { requireLogin, validateUser } from "../utils/middlewares/users";
import { authenticateToken } from "../utils/middlewares/auth";
import { Router } from 'express';
import * as express from 'express';

const router: Router = express.Router();

router.route('/profile/:id/movies/reviews/:movieId')
  .post(requireLogin, authenticateToken, validateUser, createMovieReview)

router.route('/profile/:id/actors/reviews/:actorId')
  .post(requireLogin, authenticateToken, validateUser, createActorReview)

router.route('/profile/:id/movies/reviews/:movieId/:reviewId')
  .delete(requireLogin, authenticateToken, validateUser, deleteMovieReview)

router.route('/profile/:id/actors/reviews/:actorId/:reviewId')
  .delete(requireLogin, authenticateToken, validateUser, deleteActorReview)

export default router;