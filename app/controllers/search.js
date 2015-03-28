
// # search

var _ = require('underscore');
var util = require('util');
var _str = require('underscore.string');
var request = require('request');
_.mixin(_str.exports());

var paginate = require('express-paginate');

exports = module.exports = function(Party) {

  function findParty(req, res, next) {

    Party.findOne({ party_code : req.query.party_code}, function(err, party) {

      if (err) return next(err);

      if (!party) {
        res.redirect('/parties');
        return;
      }

      res.redirect('/parties/' + party.id);
    });
  }

  function searchSpotify(req, res, next) {
    console.log('User:');
    console.log(req.user);
    console.log('Request:');
    console.log(req);

  }

  return {
    findParty: findParty,
    searchSpotify : searchSpotify
  };

};

exports['@singleton'] = true;
exports['@require'] = [ 'models/party' ];
