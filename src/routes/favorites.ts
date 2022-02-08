import {renderFavoriteMovies, renderFavoriteActors} from "../controller/favorites";
import { Router } from 'express';
import * as express from 'express';

const router: Router = express.Router();

router.route('/movies/favorites')
  .get(renderFavoriteMovies)

router.route('/actors/favorites')
  .get(renderFavoriteActors)

export default router;