import { RequestHandler } from 'express';
import { ExpressError } from '../ErrorHandler';

//app use controller. available every req/res
//The res.locals property is an object that contains response local variables scoped to the request and because of this, 
//it is only available to the view(s) rendered during that request / response cyc
export const handleViews: RequestHandler = async (req, res, next) => {
  //assign userid info which is added in login to res.locals to change navbar.
  res.locals.id = req.session.userid
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
}

//unknown url handler
export const NotFound: RequestHandler = (req, res, next) => {
  next(new ExpressError('Page not Found', 404))
}

