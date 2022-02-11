import { Actor } from '../entity/Actors'
import { Review } from '../entity/Review'
import { Movie } from '../entity/Movies'
import { User } from '../entity/User'
import { RequestHandler } from 'express';

//creates movie review entity and saves it into db.
export const createMovieReview: RequestHandler = async (req, res) => {
  //get body, rating from req.body
  const { reviewBody, reviewRating, movieName, like } = req.body
  //getuser id from params    
  const id = +req.params.id;
  //get user and movie info by ids that the review is submitted.
  const currentUser = await User.findOne({ id: Number(req.headers.id) });
  const currentMovie = await Movie.findOne({ id: Number(req.params.movieId) });
  //if movie or user exist, continue. 
    if (currentUser.id === id && currentMovie) {
        try {
          //get Review entity and create a new Review using the given information.
          const newReview = Review.create({
            user: currentUser,
            username: currentUser.username || 'anonymous',
            userId : currentUser.id,
            movie: currentMovie,
            body: reviewBody,
            rating: reviewRating
          })
          await Review.save(newReview);
          req.flash('success', 'Review added')     
          return res.status(200).redirect(`/movies/favorites`) 
          } catch (e) {
              //catch if save throws an error.
              console.log(e)
              req.flash('error', 'Something went wrong! Review validation failed! - createMovieReview')
              return res.status(500).redirect(`/movies/favorites`)
            }
    } else {
      //if movie or user doesnt exist, flash an error. 
      req.flash('error', 'Something went wrong! Either You dont have permission to do that! or the Movie does not exist - createMovieReview')
      return res.status(403).redirect(`/movies/favorites`);
    }
}

//creates movie review entity and saves it into db.
export const createActorReview: RequestHandler = async (req, res) => {
  //get body, rating from req.body
  const { reviewBody, reviewRating, actorName, like } = req.body
  //get user id from params  
  const id = +req.params.id;
  //get user and actor info by ids that the review is submitted.
  const currentUser = await User.findOne({ id: Number(req.headers.id) });
  const currentActor = await Actor.findOne({ id: Number(req.params.actorId) });
  //if actor or user exist, continue. 
  if (currentUser.id === id && currentActor) {
      try {
        //get Review entity and create a new Review using the given information.
        const newReview = Review.create({
          user: currentUser,
          username: currentUser.username || 'anonymous',
          userId : currentUser.id,
          actor: currentActor,
          body: reviewBody,
          rating: reviewRating
        })
        await Review.save(newReview);
        req.flash('success', 'Review added')     
        return res.status(200).redirect(`/actors/favorites`) 
        } catch (e) {
            //catch if save throws an error.
            console.log(e)
            req.flash('error', 'Something went wrong! Review validation failed! - createActorReview')
            return res.status(500).redirect(`/actors/favorites`)
          }
  } else {
    //if actor or user doesnt exist, flash an error. 
    req.flash('error', 'Something went wrong! Either You dont have permission to do that! or the Actor does not exist - createActorReview')
    return res.status(403).redirect(`/actors/favorites`);
  }
}



//deletes movie review submitted by user.
export const deleteMovieReview: RequestHandler = async (req, res) => {
  //get user, movie, review ids from params and info from db. 
  const id = +req.params.id;
  const movieId = +req.params.movieId;
  const reviewId = +req.params.reviewId;
  const currentUser = await User.findOne({ id: Number(req.headers.id) });
  const currentMovie = await Movie.findOne({ id: Number(req.params.movieId) });
  const currentReview = await Review.findOne({ id: Number(req.params.reviewId) });
  //if user, movie and review exists, continue.
  if (currentUser.id === id && currentMovie && currentReview) {
    //if Review exist On the submitted movie by the user, continue. relational db query used here.
    const isReviewExistOnMovieByUser = await Review.findOne({
      where: {
        user: { id: id },
        id: reviewId,
        movie: {id: movieId}
      },
      relations: ['user', 'movie']
    });

    if (isReviewExistOnMovieByUser) {
      //after security check, remove the review.
      try {
        await Review.remove(isReviewExistOnMovieByUser)
        req.flash('success', 'Review removed')
        return res.status(200).redirect(`/movies/favorites`)
      } catch (error) {
        console.log(error)
        //if remove throws an error, flash an error.
        req.flash('error', `Sorry. Something went wrong. - Delete Movie Review`)
        return res.status(500).redirect(`/movies/favorites`)
      } 
    } else {
      //if security check fails, flash an error.
      req.flash('error', 'You dont have permission to do that! - deleteMovieReview')
      return res.status(403).redirect(`/movies/favorites`);
    }
  } else {
    //if security check fails, flash an error.
      req.flash('error', 'You dont have permission to do that! - deleteMovieReview')
      return res.status(403).redirect(`/movies/favorites`);
  }
}

export const deleteActorReview: RequestHandler = async (req, res) => {
  //get user, movie, review ids from params and info from db
  const id = +req.params.id;
  const actorId = +req.params.actorId;
  const reviewId = +req.params.reviewId;
  const currentUser = await User.findOne({ id: Number(req.headers.id) });
  const currentActor = await Actor.findOne({ id: Number(req.params.actorId) });
  const currentReview = await Review.findOne({ id: Number(req.params.reviewId) });
  //if user, movie and review exists, continue.
  if (currentUser.id === id && currentActor && currentReview) {
    //if Review exist On the submitted movie by the user, continue. relational db query used here.
    const isReviewExistOnActorByUser = await Review.findOne({
      where: {
        user: { id: id },
        id: reviewId,
        actor: {id: actorId}
      },
      relations: ['user', 'actor']
    });
    if (isReviewExistOnActorByUser) {
      //after security check, remove the review.
      try {
        await Review.remove(isReviewExistOnActorByUser)
        req.flash('success', 'Review removed')
        return res.status(200).redirect(`/actors/favorites`)
      } catch (error) {
        //if remove throws an error, flash an error.
        console.log(error)
        req.flash('error', `Sorry. Something went wrong. - Delete Actor Review`)
        return res.status(500).redirect(`/actors/favorites`)
      } 
    } else {
      //if security check fails, flash an error.
      req.flash('error', 'You dont have permission to do that! - deleteActorReview')
      return res.status(403).redirect(`/actors/favorites`);
    }
  } else {
    //if security check fails, flash an error.
      req.flash('error', 'You dont have permission to do that! - deleteActorReview')
      return res.status(403).redirect(`/actors/favorites`);
  }
}