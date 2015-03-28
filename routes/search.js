
// app - routes - search

var express = require('express');

exports = module.exports = function(IoC) {

  var app = this;
  var router = express.Router();
  var controller = IoC.create('controllers/search');

  router.get(
    '/search',
    controller.findParty
  );

  router.get(
    '/search-spotify',
    controller.searchSpotify
  )

  app.use(
    '/',
    router
  );
};

exports['@require'] = [ '$container' ];
exports['@singleton'] = true;
