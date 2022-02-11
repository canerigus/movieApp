import { RequestHandler } from 'express';
import { Actor } from '../../entity/Actors';

//middlewares for actors CRUD

//checks if the User currently holds the same Actor in their inventory. if Actor exists, denies the request, if not next();
export const isUserAlreadyOwnActor: RequestHandler = async (req, res, next) => {
	const { name, image, films } = req.body
	const isActorExist = await Actor.findOne({ where: { user: { id: req.headers.id }, name: name } });
		if (isActorExist) {
			req.flash('error', 'Actor already exists!')
			return res.status(422).redirect('search')
		} else if (!isActorExist) {
			next();
		} else {
			//flash an error if post request does not match with the logged in user's ID
			req.flash('error', 'You dont have permission to do that! - saveActorFavorite')
			return res.status(403).redirect(`/profile/${req.headers.id}`);
		}
};

//checks if the User currently holds the Actor entity in their inventory. if Actor exists next() to changeVisibility, if not deny the request.
export const isUserOwnActor: RequestHandler = async (req, res, next) => {
  const { actorID, isVisible } = req.body
	const isActorExist = await Actor.findOne({ where: { user: { id: req.headers.id }, id: actorID } });
	if (isActorExist) {
		next();
	}
	else {
		//flash an error if post request does not match with the logged in user's ID
		req.flash('error', 'You dont have permission to do that! - change Actor Visibility')
		return res.status(403).redirect(`/profile/${req.headers.id}`);
	}
};
