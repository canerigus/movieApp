import dotenv from "dotenv"
if (process.env.NODE_ENV !== 'production') { dotenv.config() }

import "reflect-metadata";

import session from 'express-session';
import express, { RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import methodOverride from 'method-override'
import path from 'path';

//import Routes
import { handleViews } from "./utils/middlewares/views";

import userRouter from './routes/users';
import moviesRouter from './routes/movies';
import actorsRouter from './routes/actors';
import favoriteRouter from './routes/favorites';
import reviewsRouter from './routes/reviews';
import authRouter from './routes/auth';
// * routes handler
import { NotFound } from "./utils/middlewares/views";
//error handler for app
import { errorHandler } from "./utils/ErrorHandler";
//cookie options
import { sessionOptions } from "./utils/config/config"
//database connection
import { connectDatabase } from "./utils/config/config";  
/* import './src/utils/auth/passport.cookie'; */
/* import './src/utils/auth/passport.jwt'; */
import './utils/auth/strategy';
/* import './src/utils/auth/passport.facebook'; */
import passport from 'passport'

//app options
const app = express();
connectDatabase();

app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), './client/views'));
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(path.resolve(), './client/public')));
app.use(session(sessionOptions));
app.use(flash())

//renders flash success&error&navbar. uses res.locals properties. 
app.use(handleViews)

//routes
app.use(userRouter)
app.use(authRouter)
app.use(favoriteRouter)
app.use(actorsRouter)
app.use(moviesRouter)
app.use(reviewsRouter)

//invalid route handler next'ed into error handler below to be catched, so that we can display the error.
app.all('*', NotFound)
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Serving on port ${process.env.PORT}`);
});