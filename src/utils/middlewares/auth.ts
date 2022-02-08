import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';

//generating JWT token function.
export const generateAccessToken = (user: Object) => {
	return jwt.sign(user, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1d' });
};

//jwt token authentication function.
//after authentication, we set user info in decoded to req.user in which
//the middleware will pass it to renderUsers to display info on /users
export const authenticateToken: RequestHandler = async (req, res, next) => {
	const token = req.cookies['jwt'];

	if (token == null) {
		//if token is null, set req.session.id to null to change navbar. sets res.locals.currentUser's length to 0.
		req.flash('error', 'Token Not Found!');
		return res.status(401).redirect('/login');
	}
	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
		//after verification, add decoded info (name, iat and exp) to req.user. req.user will be send to users route to be handled and displayed.
		req.headers.id = decoded.id;
		next();
	} catch (error) {
		//if token is invalid, set req.session.idto null to change navbar. sets res.locals.currentUser's length to 0.
		req.flash('error', 'Token expired!');
		return res.status(401).redirect('/login');
	}
};
