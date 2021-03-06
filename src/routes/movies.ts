import {renderMovieSearch, renderMovieResults, saveMovieResults, changeMovieVisibility, deleteMovie, likeOrDislikeMovie} from "../controller/movies";
import { requireLogin, validateUser} from "../utils/middlewares/users";
import {isUserAlreadyOwnMovie, isUserOwnMovie } from "../utils/middlewares/movies";
import { authenticateToken } from "../utils/middlewares/auth";
import { Router } from 'express';
import * as express from 'express';

const router: Router = express.Router();

router.route('/profile/:id/movies/search')
  .get(requireLogin,authenticateToken, renderMovieSearch)

router.route('/profile/:id/movies/results')
  .get(requireLogin, authenticateToken, renderMovieResults)
  .post(requireLogin, authenticateToken,  validateUser, isUserAlreadyOwnMovie, saveMovieResults)
  .put(requireLogin, authenticateToken, validateUser, isUserOwnMovie, changeMovieVisibility)

router.route('/profile/:id/movies/results/:movieid')
  .put(requireLogin, authenticateToken, validateUser, likeOrDislikeMovie)
  .delete(requireLogin, authenticateToken, validateUser, deleteMovie)

export default router;