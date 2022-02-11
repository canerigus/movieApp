import { RequestHandler } from 'express';
import { Movie } from '../../entity/Movies';

//middlewares for movies CRUD

//checks if the User currently holds the same Movie in their inventory. if Movie exists, denies the request, if not next();
export const isUserAlreadyOwnMovie: RequestHandler = async (req, res, next) => {
	const { imdbID } = req.body
	const isMovieExistOnUser = await Movie.findOne({ where: { user: { id: req.headers.id }, imdbID: imdbID } });
		if (isMovieExistOnUser) {
			req.flash('error', 'Movie already exists!')
			return res.status(422).redirect('search')
		} else if (!isMovieExistOnUser) {
			next();
		} else {
			//flash an error if post request does not match with the logged in user's ID
			req.flash('error', 'You dont have permission to do that! - saveMovieFavorite')
			return res.status(403).redirect(`/profile/${req.headers.id}`);
		}
};

//checks if the User currently holds the Movie entity in their inventory. if Movie exists next() to changeVisibility, if not deny the request.
export const isUserOwnMovie: RequestHandler = async (req, res, next) => {
	const { movieID, isVisible } = req.body
	const isMovieExist = await Movie.findOne({ where: { user: { id: req.headers.id }, id: movieID } });
	if (isMovieExist) {
		next();
	}
	else {
		//flash an error if post request does not match with the logged in user's ID
		req.flash('error', 'You dont have permission to do that! - change Movie Visibility')
		return res.status(403).redirect(`/profile/${req.headers.id}`);
	}
};
