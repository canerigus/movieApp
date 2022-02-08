import { RequestHandler } from 'express';
import { User } from '../entity/User';
import { Actor } from '../entity/Actors';
import axios from 'axios';

//session veya token olmadan, backwards vs. /search deki form submitlenebiliyor ve results da sonuç veriyor???
//Çöz!

export const renderActorSearch: RequestHandler = async (req, res) => {
  const reqHeadersId = req.headers.id;
	res.status(200).render('actors/search', { reqHeadersId:reqHeadersId });
};

export const renderActorResults: RequestHandler = async (req, res) => {
  const reqHeadersId = req.headers.id;
	const tmdb_key = process.env.TMDB_API_KEY;
	const actor = req.query['actor'];
	if (actor) {
		try {
			await axios.get(`https://api.themoviedb.org/3/search/person?api_key=${tmdb_key}&language=en-US&query=${actor}&page=1&include_adult=false`)
				.then((response) => {
					const result = response.data.results;
					if (result.length) {
						const name = result[0].name;
						const knownFilms = response.data.results[0].known_for;
						const films = new Array();
						knownFilms.forEach((film: any) => {films.push(film.title);});
						const image = 'https://image.tmdb.org/t/p/original/' + response.data.results[0].profile_path;
						return res.status(200).render('actors/results', { name, image, films, reqHeadersId:reqHeadersId });
					} else {
						req.flash('error', 'Sorry. Actor not found! :( Please Try to be more precise :))');
						return res.status(422).redirect('search');
					}
				});
		} catch (error) {
			req.flash('error', 'Something went wrong with the request! :(');
			return res.status(500).redirect('search');
		}
	} else {
		req.flash('error', 'Please enter a valid actor name');
		return res.status(422).redirect('search');
	}
};


export const saveActorResults: RequestHandler = async (req, res) => {
  const { name, image, films } = req.body
  const currentUser = await User.findOne({ id: Number(req.headers.id) });
    try {
        //get Actor entity and create a new Actor using the given information.
        const newActor = Actor.create({
          user: currentUser,
          name: name,
          image: image,
          films: films
        })
        await Actor.save(newActor);
        req.flash('success', 'Actor added to favorites! :)')
        return res.status(200).redirect(`/profile/${req.headers.id}`)
    } catch (e) {
        //catch if save or validation throws an error.
        console.log(e)
        req.flash('error', 'Something went wrong! Actor validation failed!')
        return res.status(500).redirect('search')
    }
}

export const changeActorVisibility: RequestHandler = async (req, res) => { 
  
  const { actorID, isVisible } = req.body
    try {
      if (isVisible === 'true') {
        await Actor.createQueryBuilder().update(Actor).set({ isVisible: true }).where('id = :id', { id: actorID }).execute();
        req.flash('success', 'Actor shared!')
        return res.status(200).redirect(`/profile/${req.headers.id}`)
      }
      if (isVisible === 'false') {
        await Actor.createQueryBuilder().update(Actor).set({ isVisible: false }).where('id = :id', { id: actorID }).execute();
        req.flash('success', 'Actor is now hidden!')
        return res.status(200).redirect(`/profile/${req.headers.id}`)
      }
    } catch (error) {
      console.log('error - changeVisibility')
      console.log(error)
      req.flash('error', 'Something went wrong - changeActorVisibility')
      return res.status(500).redirect(`/profile/${req.headers.id}`)
    }
}


export const deleteActor: RequestHandler = async (req, res) => { 
    const actorid = +req.params.actorid;
    const isActorExistOnUser = await Actor.findOne({ where: { user: { id: req.headers.id }, id: actorid } });
  if (isActorExistOnUser) {
      try {
        await Actor.remove(isActorExistOnUser)
        req.flash('success', 'Actor removed')
        return res.status(200).redirect(`/profile/${req.headers.id}`)
      } catch (error) {
        console.log(error)
        req.flash('error', `Sorry. Something went wrong. - Delete Actor`)
        return res.status(500).redirect(`/profile/${req.headers.id}`)
      } 
  } else {
      req.flash('error', 'You dont have permission to do that! - deleteActor')
      return res.status(403).redirect(`/profile/${req.headers.id}`);
  }
}
