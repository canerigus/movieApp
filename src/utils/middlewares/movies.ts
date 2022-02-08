import { RequestHandler } from 'express';
import { Movie } from '../../entity/Movies';

export const isUserAlreadyOwnMovie: RequestHandler = async (req, res, next) => {
	const { imdbID } = req.body
	const isMovieExistOnUser = await Movie.findOne({ where: { user: { id: req.headers.id }, imdbID: imdbID } });
		if (isMovieExistOnUser) {
			req.flash('error', 'Movie already exists!')
			return res.status(422).redirect('search')
		} else if (!isMovieExistOnUser) {
			next();
		} else {
			req.flash('error', 'You dont have permission to do that! - saveMovieFavorite')
			return res.status(403).redirect(`/profile/${req.headers.id}`);
		}
};

export const isUserOwnMovie: RequestHandler = async (req, res, next) => {
	const { movieID, isVisible } = req.body
	const isMovieExist = await Movie.findOne({ where: { user: { id: req.headers.id }, id: movieID } });
	console.log(isMovieExist)
	if (isMovieExist) {
		next();
	}
	else {
		req.flash('error', 'You dont have permission to do that! - change Movie Visibility')
		return res.status(403).redirect(`/profile/${req.headers.id}`);
	}
};
