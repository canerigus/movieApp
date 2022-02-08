import {renderActorResults, renderActorSearch, saveActorResults, changeActorVisibility, deleteActor} from "../controller/actors";
import { requireLogin, validateUser } from "../utils/middlewares/users";
import { isUserOwnActor, isUserAlreadyOwnActor } from "../utils/middlewares/actors";
import { authenticateToken } from "../utils/middlewares/auth";
import { Router } from 'express';
import * as express from 'express';
import passport from 'passport';

const router: Router = express.Router();

router.route('/profile/:id/actors/search')
  .get(requireLogin, authenticateToken, renderActorSearch)

router.route('/profile/:id/actors/results')
  .get(requireLogin, authenticateToken, renderActorResults)
  .post(requireLogin, authenticateToken,  validateUser, isUserAlreadyOwnActor, saveActorResults)
  .put(requireLogin, authenticateToken, validateUser, isUserOwnActor, changeActorVisibility)

router.route('/profile/:id/actors/results/:actorid')
  .delete(requireLogin, authenticateToken, validateUser, deleteActor)

export default router;