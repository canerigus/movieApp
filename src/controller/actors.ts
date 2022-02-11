import { RequestHandler } from 'express';
import { User } from '../entity/User';
import { Actor } from '../entity/Actors';
import axios from 'axios';

//renders actor search page. gets authenticated user id from headers.
export const renderActorSearch: RequestHandler = async (req, res) => {
  const reqHeadersId = req.headers.id;
	res.status(200).render('actors/search', { reqHeadersId:reqHeadersId });
};

//renders actor results page. gets authenticated user id from headers and tmdb api key form env.
export const renderActorResults: RequestHandler = async (req, res) => {
  const reqHeadersId = req.headers.id;
	const tmdb_key = process.env.TMDB_API_KEY;
  const actor = req.query['actor'];
  //if an actor present on url, continue
	if (actor) {
    try {
      //search actor on tmdb. if any result, bring the first result. configure the data and render results page with info taken from tmdb.
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
            //if no actor found on tmdb, flash an error and send 422 status code to client.
						req.flash('error', 'Sorry. Actor couldnt found. Please Try to be more precise');
						return res.status(422).redirect('search');
					}
				});
    } catch (error) {
      //if api error is present, flash an error.
			req.flash('error', 'Something went wrong with the request!');
			return res.status(500).redirect('search');
		}
  } else {
    //if client error is present, flash an error.
		req.flash('error', 'Please enter a valid actor name');
		return res.status(400).redirect('search');
	}
};


//save actor results. get actor info from body and find the user by headers id.
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
        //save new actor into database.
        await Actor.save(newActor);
        req.flash('success', 'Actor added to favorites')
        return res.status(200).redirect(`/profile/${req.headers.id}`)
    } catch (e) {
        //catch if save throws an error.
        console.log(e)
        req.flash('error', 'Something went wrong. Actor validation failed.')
        return res.status(500).redirect('search')
    }
}

//change actor visibility. this functions basically controls the state of 'isVisible' entity parameter.
export const changeActorVisibility: RequestHandler = async (req, res) => { 
  //get actorID and isVisible info from body from hidden html.
  const { actorID, isVisible } = req.body
  try {
      //there are two states. either isVisible is true or false. default is false.
      //isVisible in IF condition is different from the entity. it comes from html input value.
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
      //throws server error if something goes wrong while changing the state of isVisible.
      console.log('error - changeVisibility')
      console.log(error)
      req.flash('error', 'Something went wrong - changeActorVisibility')
      return res.status(500).redirect(`/profile/${req.headers.id}`)
    }
}

//deletes the actor which is added to the favorites.
export const deleteActor: RequestHandler = async (req, res) => { 
  const actorid = +req.params.actorid;
  //searches the DB for Actor row and its sub entities. if the actor exists on user, in other words user 'has' the actor entity, continue. 
  const isActorExistOnUser = await Actor.findOne({ where: { user: { id: req.headers.id }, id: actorid } });
  if (isActorExistOnUser) {
    try {
        //Entity.remove function cascades all reviews and other info exists on entity.
        await Actor.remove(isActorExistOnUser)
        req.flash('success', 'Actor removed')
        return res.status(200).redirect(`/profile/${req.headers.id}`)
    } catch (error) {
      //if something goes wrong while deleting the entity, flash an error.
        console.log(error)
        req.flash('error', `Sorry. Something went wrong. - Delete Actor`)
        return res.status(500).redirect(`/profile/${req.headers.id}`)
      } 
  } else {
      //if the actor doesnt exists on user, in other words user 'does not have' the actor entity, flash error. 
      req.flash('error', 'You dont have permission to do that! - deleteActor')
      return res.status(403).redirect(`/profile/${req.headers.id}`);
  }
}

//controls the LIKE functionality on Actor entity.
export const likeOrDislikeActor: RequestHandler = async (req, res) => {
  //get likeState from html input
  const likeState: string = req.body.like
  //get actorID from params and find Actor entity.
  const actorID = +req.params.actorid;
  const likedActor = await Actor.findOne({ id: actorID });
  //get currentUser info from headers.
  const currentUser = await User.findOne({ id: Number(req.headers.id) });
  //change actor ID number to string
  const likedActorId = "" + likedActor.id
  //check currentUser's likedactors parameter if the actor's id exists. 
  const isUserAlreadyLikedTheActor = currentUser.likedactors.find(element => element === `${likedActor.id}`);
    if(likedActor){
      try {
        //if likeState for currentUser on Actor entity 'true' AND the user doesnt have the actor on their likedactors, continue.
        //this part is for LIKE functionality. Below one is for DISLIKE.
        if (likeState === 'true' && !isUserAlreadyLikedTheActor) {
          //increment likescount by 1
          const newLikesCount = likedActor.likescount + 1;
          //push actorID to currentUser's likedactors array.
          const newLikedActorsByUser = currentUser.likedactors;
          newLikedActorsByUser.push(likedActorId)
          //update the new states for Actor's likescount and User's likedactors.  
          await Actor.createQueryBuilder().update(Actor).set({ likescount: newLikesCount }).where('id = :id', { id: actorID }).execute();
          await User.createQueryBuilder().update(User).set({likedactors: newLikedActorsByUser}).where('id = :id', { id: Number(req.headers.id) }).execute();
          req.flash('success', `${likedActor.name} liked`)
          return res.status(200).redirect(`/actors/favorites`)
        }
        //if likeState for currentUser on Actor entity 'false' AND the user has the actor on their likedactors, continue.
        //DISLIKE part.
        if (likeState === 'false' && isUserAlreadyLikedTheActor) {
          //decrement likescount by 1
          const newLikesCount = likedActor.likescount - 1;
          //find the index of actorID in currentUser's likedactors array. Then splice that index to remove the Actor ID from User's likedactors array.
          const indexOfLikedActor = currentUser.likedactors.indexOf(likedActorId);
          if (indexOfLikedActor > -1) {
            currentUser.likedactors.splice(indexOfLikedActor, 1);
          }
          //update the new states for Actor's likescount and User's likedactors.  
          await Actor.createQueryBuilder().update(Actor).set({ likescount: newLikesCount }).where('id = :id', { id: actorID }).execute();
          await User.createQueryBuilder().update(User).set({likedactors: currentUser.likedactors}).where('id = :id', { id: Number(req.headers.id) }).execute();
          req.flash('success', `${likedActor.name} no longer liked`)
          return res.status(200).redirect(`/actors/favorites`)
        }
      } catch (error) {
        console.log(error)
        //flash an error if something goes wrong when updating the entities.
        req.flash('error', `Sorry. Something went wrong. - Like Actor`)
        return res.status(500).redirect(`/actors/favorites`)
      } 
    } else {
      //flash an error if actor does not exist..
      req.flash('error', 'Actor does not exist. - Like Actor')
      return res.status(404).redirect(`/actors/favorites`)
    }

}