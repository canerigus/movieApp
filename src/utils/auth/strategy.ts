import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import FacebookStrategy from 'passport-facebook';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.use(new FacebookStrategy.Strategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
},
  function (accessToken, refreshToken, profile, cb) {
  
    return cb(null, profile);
}
));

passport.serializeUser((user, cb) => process.nextTick(() => cb(null, user)));
passport.deserializeUser((user, cb) => process.nextTick(() => cb(null, user)));