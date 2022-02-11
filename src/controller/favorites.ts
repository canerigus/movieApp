import { RequestHandler } from "express";
import { Actor } from "../entity/Actors";
import { Movie } from "../entity/Movies";
import { User } from "../entity/User";


//renders the favorite movies by shared by users page. gets all visible movies and user info from session for views
export const renderFavoriteMovies: RequestHandler = async (req, res) => {
  const sharedMovies = await Movie.find({ where: { isVisible: true }, relations: ["user", "reviews"] }) 
  const currentUser = await User.findOne({id: req.session.userid})
  res.status(200).render('movies/favorites', { sharedMovies,currentUser })
}
//renders the favorite actors by shared by users page. gets all visible actors and user info from session for views
export const renderFavoriteActors: RequestHandler = async (req, res) => {
  const sharedActors = await Actor.find({ where: { isVisible: true }, relations: ['reviews', "user"] })
  const currentUser = await User.findOne({id: req.session.userid})
  res.status(200).render('actors/favorites', {sharedActors, currentUser})
}


