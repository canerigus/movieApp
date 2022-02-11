import { RequestHandler } from 'express';

//session checker function 
export const requireLogin: RequestHandler = (req, res, next) => {
	if (!req.session.userid) {
		req.flash('error', 'Session Expired');
		return res.status(401).redirect('/login');
	}
	else if (req.session.userid) {
		next();
	}
	else {
		req.flash('error', 'Session not verified.');
		return res.status(401).redirect('/login');
	}
};

//validateUser middleware. Checks params' id and headers'id(authenticated user id) if they match. if so next(), if not flash an error.
export const validateUser: RequestHandler = async (req, res, next) => {
	const queryId = req.params.id
	const userId = ""+req.headers.id
		if (queryId === userId) {
			next();
		} else {
			req.flash('error', 'You do not have permission to do that! - Validate User');
			res.status(403).redirect(`/profile/${req.headers.id}`);
		}
};
