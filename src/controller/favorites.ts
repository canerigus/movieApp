import { RequestHandler } from "express";
import { Actor } from "../entity/Actors";
import { Movie } from "../entity/Movies";



export const renderFavoriteMovies: RequestHandler = async (req, res) => {
  const sharedMovies = await Movie.find({ where: { isVisible: true }, relations: ["user", "reviews"] })
  res.status(200).render('movies/favorites', {sharedMovies})
}

export const renderFavoriteActors: RequestHandler = async (req, res) => {
  const sharedActors = await Actor.find({ where: { isVisible: true }, relations: ['reviews', "user"] })
  res.status(200).render('actors/favorites', {sharedActors})
}


