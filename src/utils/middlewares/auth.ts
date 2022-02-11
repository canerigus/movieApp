import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';

//generating JWT token function.
export const generateAccessToken = (user: Object) => {
	return jwt.sign(user, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1d' });
};

//ALL USER authentication depends on this middleware and JWT token.
//jwt token authentication function.
//after authentication, we set user info in decoded to req.headers in which the middleware will pass it to next middleware to be used.
export const authenticateToken: RequestHandler = async (req, res, next) => {
	const token = req.cookies['jwt'];
	if (token == null) {
		//if token is null, set req.session.id to null to change navbar. sets res.locals.currentUser's length to 0.
		req.flash('error', 'Token Not Found!');
		return res.status(401).redirect('/login');
	}
	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
		//after verification, add decoded info (name, iat and exp) to req.headers. req.header will be send middlewares to be handled.
		req.headers.id = decoded.id;
		next();
	} catch (error) {
		//if token is invalid, set req.session.id to null to change navbar. sets res.locals.currentUser's length to 0.
		req.flash('error', 'Token expired!');
		return res.status(401).redirect('/login');
	}
};
