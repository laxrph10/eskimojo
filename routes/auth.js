
// # routes - auth

var passport = require('passport');

exports = module.exports = function(IoC, policies, settings) {

  var app = this;

  // log in
  app.get(
    '/login',
    policies.ensureLoggedOut(),
    function(req, res) {
      res.render('login', { title: 'Log In' });
    }
  );

  app.post(
    '/login',
    policies.ensureLoggedOut(),
    passport.authenticate('local', {
      successReturnToOrRedirect: '/',
      failureFlash: true,
      failureRedirect: '/login'
    })
  );

  // logout
  app.get(
    '/logout',
    policies.ensureLoggedIn(),
    function(req, res) {
      req.logout();
      req.flash('success', 'You have successfully logged out');
      res.redirect('/');
    }
  );

  // sign up
  app.get('/signup', policies.ensureLoggedOut(), function(req, res) {
    res.render('signup', { title: 'Sign Up' });
  });

  app.post(
    '/signup',
    policies.ensureLoggedOut(),
    IoC.create('controllers/signup')
  );

  // forgot password
  app.get(
    '/forgot',
    policies.ensureLoggedOut(),
    function(req, res) {
      res.render('forgot', {
        title: 'Forgot Password'
      });
    }
  );

  app.post(
    '/forgot',
    policies.ensureLoggedOut(),
    IoC.create('controllers/forgot')
  );

  // reset password
  var reset = IoC.create('controllers/reset');

  app.get(
    '/reset/:reset_token',
    policies.ensureLoggedOut(),
    reset.get
  );

  app.post(
    '/reset/:reset_token',
    policies.ensureLoggedOut(),
    reset.post
  );

  // ## Spotify Authentication
  if (settings.spotify.enabled) {

    app.get(
      '/auth/spotify',
      policies.ensureLoggedOut(),
      passport.authenticate('spotify', {
        scope: settings.spotify.scope
      })
    );

    app.get(
      '/auth/spotify/callback',
      policies.ensureLoggedOut(),
      passport.authenticate('spotify', {
        successFlash: true,
        successReturnToOrRedirect: '/parties',
        failureFlash: true,
        failureRedirect: '/'
      })
    );

  }
};

exports['@require'] = [ '$container', 'policies', 'igloo/settings' ];
exports['@singleton'] = true;
