import { RequestHandler} from "express";
import { User } from "../entity/User";
import { Movie } from "../entity/Movies";
import axios from 'axios'


//session veya token olmadan, backwards vs. /search deki form submitlenebiliyor ve results da sonuç veriyor???
//Çöz!

export const renderMovieSearch: RequestHandler = async (req, res) => {
  const reqHeadersId = req.headers.id;
  res.status(200).render('movies/search', {reqHeadersId: reqHeadersId})
}

export const renderMovieResults: RequestHandler = async (req, res) => {
  const reqHeadersId = req.headers.id;
  const api_key = process.env.OMDB_API_KEY
  const movie = req.query['movie']
  const year = req.query['year']
  if (movie && year) {
    try {
      await axios.get(`https://www.omdbapi.com/?apikey=${api_key}&t=${movie}&y=${year}`).then((response) => {
        const title = response.data['Title']
        const year = response.data['Year']
        const image = response.data['Poster']
        const imdbRating = response.data['imdbRating']
        const plot = response.data['Plot']
        const imdbID = response.data['imdbID']
        const err = response.data['Error']
        if (err) {
          console.log('error geldi burada!')
          console.log(err)
          req.flash('error','We couldnt find the movie! :( Please, Try to be more precise :)')
          return res.status(400).redirect('search') 
        }
        return res.status(200).render('movies/results', { title, year, image, imdbRating, plot, imdbID , reqHeadersId: reqHeadersId }) 
      })
    } catch (error) {
      console.log(error)
      console.error(error)
      req.flash('error','Something went wrong with the request! :(')
      return res.status(500).redirect('search') 
    }
  } else {
    req.flash('error','Please enter a movie and a year')
    return res.status(400).redirect('search') 
  }
}

export const saveMovieResults: RequestHandler = async (req, res) => {
  const { title, year, image, imdbRating, plot, imdbID } = req.body
  const currentUser = await User.findOne({ id: Number(req.headers.id) });
  try {
    //get Movie entity and create a new Movie using the given information.
    const newMovie = Movie.create({
      user: currentUser,
      title: title,
      year: year,
      image: image,
      imdbRating: imdbRating,
      plot: plot,
      imdbID: imdbID
    })
    await Movie.save(newMovie);
    req.flash('success', 'Movie added to favorites! :)')
    return res.status(200).redirect(`/profile/${req.headers.id}`)
  } catch (e) {
    //catch if save or validation throws an error.
    console.log(e)
    req.flash('error', 'Something went wrong! Movie validation failed!')
    return res.status(500).redirect('search')
  }
}

export const changeMovieVisibility: RequestHandler = async (req, res) => { 
  const { movieID, isVisible } = req.body
    try {
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
      console.log('error - changeVisibility')
      console.log(error)
      req.flash('error', 'Something went wrong - changeMovieVisibility')
      return res.status(500).redirect(`/profile/${req.headers.id}`)
    }
}


export const deleteMovie: RequestHandler = async (req, res) => { 
  const movieid = +req.params.movieid;
  const isMovieExistOnUser = await Movie.findOne({ where: { user: { id: req.headers.id }, id: movieid } });
    if(isMovieExistOnUser){
      try {
        await Movie.remove(isMovieExistOnUser)
        req.flash('success', 'Movie removed')
        return res.status(200).redirect(`/profile/${req.headers.id}`)
      } catch (error) {
        console.log(error)
        req.flash('error', `Sorry. Something went wrong. - Delete Movie`)
        return res.status(500).redirect(`/profile/${req.headers.id}`)
      } 
    } else {
      req.flash('error', 'You dont have permission to do that! - deleteMovie')
      return res.status(401).redirect(`/profile/${req.headers.id}`);
    }

}

