import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import FacebookStrategy from 'passport-facebook';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.use(new FacebookStrategy.Strategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/callback",
},
  function (accessToken, refreshToken, profile, cb) {
  
    return cb(null, profile);
}
));

passport.serializeUser((user, cb) => process.nextTick(() => cb(null, user)));
passport.deserializeUser((user, cb) => process.nextTick(() => cb(null, user)));

/*
NOT USED

passport.use(
  new jwt.Strategy(
    {
      jwtFromRequest: (req) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies.jwt;
        }
        return token;
      },
      secretOrKey: process.env.ACCESS_TOKEN_KEY,
    },
    (payload, done) => {
      if (!payload) {
        return done('Token Not Found');
      }
      return done(null, payload);
    }
  )
);

export const AuthUser = passport.authenticate('jwt', { session: false ,failureRedirect: '/login'});

passport.serializeUser((user, cb) => process.nextTick(() => cb(null, user)));
passport.deserializeUser((user, cb) => process.nextTick(() => cb(null, user)));
 */