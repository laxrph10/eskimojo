
// # sessions

var flash = require('connect-flash');
var passport = require('passport');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var randomstring = require('randomstring-extended');
var connectLiveReload = require('connect-livereload');
var SpotifyStrategy = require('passport-spotify').Strategy;
var validator = require('validator');
var _ = require('underscore');

exports = module.exports = function(IoC, settings, sessions, User, policies) {

  var app = this;

  // pass a secret to cookieParser() for signed cookies
  app.all(policies.notApiRouteRegexp, cookieParser(settings.cookieParser));

  // add req.session cookie support
  settings.session.store = sessions;
  app.all(policies.notApiRouteRegexp, session(settings.session));

  // support live reload
  // (note this must come after sessions)
  // <http://stackoverflow.com/a/26740588>
  if (settings.server.env === 'development')
    app.all(policies.notApiRouteRegexp, connectLiveReload(settings.liveReload));

  // add support for authentication
  app.use(passport.initialize());
  app.all(policies.notApiRouteRegexp, passport.session());

  // add flash message support
  app.use(session(settings.session));
  app.use(flash());
  app.all(policies.notApiRouteRegexp, flash());

  // add passport strategies
  passport.use(User.createStrategy());
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

    // ## Spotify Authentication
  if (settings.spotify.enabled) {

    // web-based
    passport.use(new SpotifyStrategy({
      callbackURL: 'http://localhost:3000/auth/spotify/callback',
      clientID: settings.spotify.clientID,
      clientSecret: settings.spotify.clientSecret
    }, providerAuthCallback));

  }

  function providerAuthCallback(accessToken, refreshToken, profile, done) {

    if (profile.emails.length === 0 || !_.isObject(profile.emails[0]) || !validator.isEmail(profile.emails[0].value)) {
      return done(new Error('Your account did not have an email address associated with it'));
    }

    var $or = [
      {
        email: profile.emails[0].value
      }
    ];

    // normalize the auth callbacks by simply pushing to the
    // $or query that will be executed with User.findOne below
    // this allows us to simply have one auth callback for
    // different providers like Facebook, Google, etc.
    var provider = {};
    provider[profile.provider + '_id'] = profile.id;
    // note that we unshift instead of push, since we want findOne
    // to return the user based off `profile.id` which takes
    // precedence over the user's email address in `profile.emails`
    $or.unshift(provider);

    User.findOne({
      $or: $or
    }, function(err, user) {

      if (err) return done(err);

      if (user) {

        if (!user[profile.provider + '_id']) {
          user[profile.provider + '_id'] = profile.id;
        }

        if (accessToken)
          user[profile.provider + '_access_token'] = accessToken;

        if (refreshToken)
          user[profile.provider + '_refresh_token'] = refreshToken;

        return user.save(done);

      }

      user = {
        email: profile.emails[0].value
      };

      user[profile.provider + '_id'] = profile.id;

      if (accessToken)
        user[profile.provider + '_access_token'] = accessToken;

      if (refreshToken)
        user[profile.provider + '_refresh_token'] = refreshToken;

      // if the user signed in with another service
      // then create a random password for them
      User.register(user, randomstring.token(), function(err, user) {
        if (err) return done(err);
        if (!user)
          return done(new Error('An error has occured while registering, please try later'));
        done(null, user);
        user.sendWelcomeEmail();
      });

    });

  }

};

exports['@require'] = [ '$container', 'igloo/settings', 'igloo/sessions', 'models/user', 'policies' ];
