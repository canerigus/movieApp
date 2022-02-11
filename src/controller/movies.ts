import { RequestHandler} from "express";
import { User } from "../entity/User";
import { Movie } from "../entity/Movies";
import axios from 'axios'



//renders movies search page. gets authenticated user id from headers.
export const renderMovieSearch: RequestHandler = async (req, res) => {
  const reqHeadersId = req.headers.id;
  res.status(200).render('movies/search', { reqHeadersId: reqHeadersId })
}

//renders movie results page. gets authenticated user id from headers and tmdb api key form env.
export const renderMovieResults: RequestHandler = async (req, res) => {
  const reqHeadersId = req.headers.id;
  const api_key = process.env.OMDB_API_KEY
  const movie = req.query['movie']
  const year = req.query['year']
  //if an movie present on url, continue
  if (movie && year) {
    try {
      //search movie on omdb. if any result, bring the first result. configure the data and render results page with info taken from tmdb.
      await axios.get(`https://www.omdbapi.com/?apikey=${api_key}&t=${movie}&y=${year}`).then((response) => {
        const title = response.data['Title']
        const year = response.data['Year']
        const image = response.data['Poster']
        const imdbRating = response.data['imdbRating']
        const plot = response.data['Plot']
        const imdbID = response.data['imdbID']
        const err = response.data['Error']
        if (err) {
          //if err thrown by api, flash an error.
          console.log(err)
          req.flash('error','We couldnt find the movie. Please, Try to be more precise')
          return res.status(400).redirect('search') 
        }
        return res.status(200).render('movies/results', { title, year, image, imdbRating, plot, imdbID , reqHeadersId: reqHeadersId }) 
      })
    } catch (error) {
      console.log(error)
      //if api error is present, flash an error.
      req.flash('error','Something went wrong with the request.')
      return res.status(500).redirect('search') 
    }
  } else {
    //if client error is present, flash an error.
    req.flash('error','Please enter a movie and a year')
    return res.status(400).redirect('search') 
  }
}

//save movie results. get movie info from body and find the user by headers id.
export const saveMovieResults: RequestHandler = async (req, res) => {
  const { title, year, image, imdbRating, plot, imdbID } = req.body
  const currentUser = await User.findOne({ id: Number(req.headers.id) });
  try {
    //get movie entity and create a new movie using the given information.
    const newMovie = Movie.create({
      user: currentUser,
      title: title,
      year: year,
      image: image,
      imdbRating: imdbRating,
      plot: plot,
      imdbID: imdbID
    })
    //save new movie into database.
    await Movie.save(newMovie);
    req.flash('success', 'Movie added to favorites!')
    return res.status(200).redirect(`/profile/${req.headers.id}`)
  } catch (e) {
    //catch if save throws an error.
    console.log(e)
    req.flash('error', 'Something went wrong! Movie validation failed!')
    return res.status(500).redirect('search')
  }
}

//change movie visibility. this functions basically controls the state of 'isVisible' entity parameter.
export const changeMovieVisibility: RequestHandler = async (req, res) => { 
  //get movieID and isVisible info from body from hidden html.
  const { movieID, isVisible } = req.body
  try {
      //there are two states. either isVisible is true or false. default is false.
      //isVisible in IF condition is different from the entity. it comes from html input value.
      if (isVisible === 'true') {
        await Movie.createQueryBuilder().update(Movie).set({ isVisible: true }).where('id = :id', { id: movieID }).execute();
        req.flash('success', 'Movie shared!')
        return res.status(200).redirect(`/profile/${req.headers.id}`)
      }
      if (isVisible === 'false') {
        await Movie.createQueryBuilder().update(Movie).set({ isVisible: false }).where('id = :id', { id: movieID }).execute();
        req.flash('success', 'Movie is now hidden!')
        return res.status(200).redirect(`/profile/${req.headers.id}`)
      }
  } catch (error) {
    //throws server error if something goes wrong while changing the state of isVisible.
      console.log(error)
      req.flash('error', 'Something went wrong - changeMovieVisibility')
      return res.status(500).redirect(`/profile/${req.headers.id}`)
    }
}

//deletes the movie which is added to the favorites.
export const deleteMovie: RequestHandler = async (req, res) => { 
  const movieID = +req.params.movieid;
  //searches the DB for movie row and its sub entities. if the movie exists on user, in other words user 'has' the movie entity, continue. 
  const isMovieExistOnUser = await Movie.findOne({ where: { user: { id: req.headers.id }, id: movieID } });
    if(isMovieExistOnUser){
      try {
        //Entity.remove function cascades all reviews and other info exists on entity.
        await Movie.remove(isMovieExistOnUser)
        req.flash('success', 'Movie removed')
        return res.status(200).redirect(`/profile/${req.headers.id}`)
      } catch (error) {
      //if something goes wrong while deleting the entity, flash an error.
        console.log(error)
        req.flash('error', `Sorry. Something went wrong. - Delete Movie`)
        return res.status(500).redirect(`/profile/${req.headers.id}`)
      } 
    } else {
      //if the movie doesnt exists on user, in other words user 'does not have' the movie entity, flash error. 
      req.flash('error', 'You dont have permission to do that! - deleteMovie')
      return res.status(401).redirect(`/profile/${req.headers.id}`);
    }

}

//controls the LIKE functionality on movie entity.
export const likeOrDislikeMovie: RequestHandler = async (req, res) => {
  //get likeState from html input
  const likeState: string = req.body.like
  //get movieID from params and find movie entity.
  const movieID = +req.params.movieid;
  const likedMovie = await Movie.findOne({ id: movieID });
  //get currentUser info from headers.
  const currentUser = await User.findOne({ id: Number(req.headers.id) });
  //change movie ID number to string
  const likedMovieId = "" + likedMovie.id
  //check currentUser's likedmovies parameter if the movie's id exists.
  const isUserAlreadyLikedTheMovie = currentUser.likedmovies.find(element => element === `${likedMovie.id}`);
    if(likedMovie){
      try {
        //if likeState for currentUser on movie entity 'true' AND the user doesnt have the movie on their likedmovies, continue.
        //this part is for LIKE functionality. Below one is for DISLIKE.
        if(likeState==='true' && !isUserAlreadyLikedTheMovie){
          //increment likescount by 1
          const newLikesCount = likedMovie.likescount + 1;
          //push movieID to currentUser's likedmovies array.
          const newLikedMoviesByUser = currentUser.likedmovies;
          newLikedMoviesByUser.push(likedMovieId)
          //update the new states for movie's likescount and User's likedmovies.  
          await Movie.createQueryBuilder().update(Movie).set({ likescount: newLikesCount }).where('id = :id', { id: movieID }).execute();
          await User.createQueryBuilder().update(User).set({likedmovies: newLikedMoviesByUser}).where('id = :id', { id: Number(req.headers.id) }).execute();
          req.flash('success', `${likedMovie.title} liked`)
          return res.status(200).redirect(`/movies/favorites`)
        }
        //if likeState for currentUser on movie entity 'false' AND the user has the movie on their likedmovies, continue.
        //DISLIKE part.
        if (likeState === 'false' && isUserAlreadyLikedTheMovie) {
          //decrement likescount by 1
          const newLikesCount = likedMovie.likescount - 1;
          //find the index of movieID in currentUser's likedmovies array. Then splice that index to remove the movie ID from User's likedmovies array.
          const indexOfLikedMovie = currentUser.likedmovies.indexOf(likedMovieId);
          if (indexOfLikedMovie > -1) {
            currentUser.likedmovies.splice(indexOfLikedMovie, 1);
          }
          //update the new states for movie's likescount and User's likedmovies.  
          await Movie.createQueryBuilder().update(Movie).set({ likescount: newLikesCount }).where('id = :id', { id: movieID }).execute();
          await User.createQueryBuilder().update(User).set({likedmovies: currentUser.likedmovies}).where('id = :id', { id: Number(req.headers.id) }).execute();
          req.flash('success', `${likedMovie.title} no longer liked`)
          return res.status(200).redirect(`/movies/favorites`)
        }
      } catch (error) {
        console.log(error)
        //flash an error if something goes wrong when updating the entities.
        req.flash('error', `Sorry. Something went wrong. - Like Movie`)
        return res.status(500).redirect(`/movies/favorites`)
      } 
    } else {
      //flash an error if movie does not exist..
      req.flash('error', 'You dont have permission to do that! - Like Movie')
      return res.status(401).redirect(`/movies/favorites`)
    }

}