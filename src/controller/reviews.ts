import { Actor } from '../entity/Actors'
import { Review } from '../entity/Review'
import { Movie } from '../entity/Movies'
import { User } from '../entity/User'
import { RequestHandler } from 'express';
/* import { handleLikes } from '../config/config'; */


export const createMovieReview: RequestHandler = async (req, res) => {
  const { reviewBody, reviewRating, movieName, like } = req.body
  /*   const likes = handleLikes(like) */
    const id = +req.params.id;
    const currentUser = await User.findOne({ id: Number(req.headers.id) });
    const currentMovie = await Movie.findOne({ id: Number(req.params.movieId) });
  /*   const newLikes = currentMovie.likes + Number(likes) */
    if (currentUser.id === id && currentMovie) {
        try {
          //get Review entity and create a new Review using the given information.
          const newReview = Review.create({
            user: currentUser,
            username: currentUser.username,
            userId : currentUser.id,
            movie: currentMovie,
            body: reviewBody,
            rating: reviewRating
          })
          await Review.save(newReview);
          /* await Movie.createQueryBuilder().update(Movie).set({ likes: newLikes }).where('id = :id', { id: currentMovie.id }).execute(); */
          console.log(newReview)
          req.flash('success', 'Review added :)')     
          return res.status(200).redirect(`/movies/favorites`) 
          } catch (e) {
              //catch if save or validation throws an error.
              console.log(e)
              req.flash('error', 'Something went wrong! Review validation failed! - createMovieReview')
              return res.status(500).redirect(`/movies/favorites`)
            }
    } else {
      req.flash('error', 'Something went wrong! Either You dont have permission to do that! or the Movie does not exist - createMovieReview')
      return res.status(403).redirect(`/movies/favorites`);
    }
}

//LIKES ? Check later.
export const createActorReview: RequestHandler = async (req, res) => {
  const { reviewBody, reviewRating, actorName, like } = req.body
/*   const likes = handleLikes(like) */
  const id = +req.params.id;
  const currentUser = await User.findOne({ id: Number(req.headers.id) });
  const currentActor = await Actor.findOne({ id: Number(req.params.actorId) });
/*   const newLikes = currentActor.likes + Number(likes) */
  if (currentUser.id === id && currentActor) {
      try {
        //get Review entity and create a new Review using the given information.
        const newReview = Review.create({
          user: currentUser,
          username: currentUser.username,
          userId : currentUser.id,
          actor: currentActor,
          body: reviewBody,
          rating: reviewRating
        })
        await Review.save(newReview);
        /* await Actor.createQueryBuilder().update(Actor).set({ likes: newLikes }).where('id = :id', { id: currentActor.id }).execute(); */
        console.log(newReview)
        req.flash('success', 'Review added :)')     
        return res.status(200).redirect(`/actors/favorites`) 
        } catch (e) {
            //catch if save or validation throws an error.
            console.log(e)
            req.flash('error', 'Something went wrong! Review validation failed! - createActorReview')
            return res.status(500).redirect(`/actors/favorites`)
          }
  } else {
    req.flash('error', 'Something went wrong! Either You dont have permission to do that! or the Actor does not exist - createActorReview')
    return res.status(403).redirect(`/actors/favorites`);
  }
}



export const deleteMovieReview: RequestHandler = async (req, res) => {
  const id = +req.params.id;
  const movieId = +req.params.movieId;
  const reviewId = +req.params.reviewId;
  const currentUser = await User.findOne({ id: Number(req.headers.id) });
  const currentMovie = await Movie.findOne({ id: Number(req.params.movieId) });
  const currentReview = await Review.findOne({ id: Number(req.params.reviewId) });
  if (currentUser.id === id && currentMovie &&  currentReview) {
    const isReviewExistOnMovieByUser = await Review.findOne({
      where: {
        user: { id: id },
        id: reviewId,
        movie: {id: movieId}
      },
      relations: ['user', 'movie']
    });
    console.log(isReviewExistOnMovieByUser)
    if (isReviewExistOnMovieByUser) {
      try {
        await Review.remove(isReviewExistOnMovieByUser)
        req.flash('success', 'Review removed')
        return res.status(200).redirect(`/movies/favorites`)
      } catch (error) {
        console.log(error)
        req.flash('error', `Sorry. Something went wrong. - Delete Movie Review`)
        return res.status(500).redirect(`/movies/favorites`)
      } 
    } else {
      req.flash('error', 'You dont have permission to do that! - deleteMovieReview')
      return res.status(403).redirect(`/movies/favorites`);
    }
    } else {
      req.flash('error', 'You dont have permission to do that! - deleteMovieReview')
      return res.status(403).redirect(`/movies/favorites`);
    }
}

export const deleteActorReview: RequestHandler = async (req, res) => {
  const id = +req.params.id;
  const actorId = +req.params.actorId;
  const reviewId = +req.params.reviewId;
  const currentUser = await User.findOne({ id: Number(req.headers.id) });
  const currentActor = await Actor.findOne({ id: Number(req.params.actorId) });
  const currentReview = await Review.findOne({ id: Number(req.params.reviewId) });
  if (currentUser.id === id && currentActor &&  currentReview) {
    const isReviewExistOnActorByUser = await Review.findOne({
      where: {
        user: { id: id },
        id: reviewId,
        actor: {id: actorId}
      },
      relations: ['user', 'actor']
    });
    if (isReviewExistOnActorByUser) {
      try {
        await Review.remove(isReviewExistOnActorByUser)
        req.flash('success', 'Review removed')
        return res.status(200).redirect(`/actors/favorites`)
      } catch (error) {
        console.log(error)
        req.flash('error', `Sorry. Something went wrong. - Delete Actor Review`)
        return res.status(500).redirect(`/actors/favorites`)
      } 
    } else {
      req.flash('error', 'You dont have permission to do that! - deleteActorReview')
      return res.status(403).redirect(`/actors/favorites`);
    }
    } else {
      req.flash('error', 'You dont have permission to do that! - deleteActorReview')
      return res.status(403).redirect(`/actors/favorites`);
    }
}