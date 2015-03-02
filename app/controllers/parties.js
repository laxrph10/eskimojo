
// # party

var _ = require('underscore');
var _str = require('underscore.string');
_.mixin(_str.exports());

var paginate = require('express-paginate');

exports = module.exports = function(Party) {

  function index(req, res, next) {
    Party.paginate({}, req.query.page, req.query.limit, function(err, pageCount, parties, itemCount) {
      if (err) {
        return next(err);
      }

      res.format({
        html: function() {
          res.render('parties', {
            parties: parties,
            pageCount: pageCount,
            itemCount: itemCount
          });
        },
        json: function() {
          // inspired by Stripe's API response for list objects
          res.json({
            object: 'list',
            has_more: paginate.hasNextPages(req)(pageCount, parties.length),
            data: parties
          });
        }
      });
    });
  }

  function _new(req, res, next) {
    res.render('parties/new');
  }

  function create(req, res, next) {
    if (!_.isString(req.body.name) || _.isBlank(req.body.name)) {
      return next({
        param: 'name',
        message: 'Name is missing or blank'
      });
    }

    Party.create({
      name: req.body.name
    }, function(err, party) {
      if (err) {
        return next(err); 
      }

      res.format({
        html: function() {
          req.flash('success', 'Successfully created party');
          res.redirect('/parties');
        },
        json: function() {
          res.json(party);
        }
      });
    });
  }

  function show(req, res, next) {
    Party.findById(req.params.id, function(err, party) {
      if (err) {
        return next(err);
      }

      if (!party) {
        return next(new Error('Party does not exist'));
      }

      res.format({
        html: function() {
          res.render('parties/show', {
            party: party
          });
        },
        json: function() {
          res.json(party);
        }
      });
    });
  }

  function edit(req, res, next) {
    Party.findById(req.params.id, function(err, party) {
      if (err) {
        return next(err);
      }

      if (!party) {
        return next(new Error('Party does not exist'));
      }

      res.render('parties/edit', {
        party: party
      });
    });
  }

  function update(req, res, next) {
    Party.findById(req.params.id, function(err, party) {
      if (err) {
        return next(err);
      }

      if (!party) {
        return next(new Error('Party does not exist'));
      }

      if (!_.isString(req.body.name) || _.isBlank(req.body.name)) {
        return next({
          param: 'name',
          message: 'Name is missing or blank'
        });
      }

      party.name = req.body.name;
      party.save(function(err, party) {
        if (err) {
          return next(err);
        }

        res.format({
          html: function() {
            req.flash('success', 'Successfully updated party');
            res.redirect('/parties/' + party.id);
          },
          json: function() {
            res.json(party);
          }
        });
      });
    });
  }

  function destroy(req, res, next) {
    Party.findById(req.params.id, function(err, party) {
      if (err) {
        return next(err);
      }

      if (!party) {
        return next(new Error('Party does not exist'));
      }

      party.remove(function(err) {
        if (err) {
          return next(err);
        }

        res.format({
          html: function() {
            req.flash('success', 'Successfully removed party');
            res.redirect('/parties');
          },
          json: function() {
            // inspired by Stripe's API response for object removals
            res.json({
              id: party.id,
              deleted: true
            });
          }
        });
      });
    });
  }

  return {
    index: index,
    'new': _new,
    create: create,
    show: show,
    edit: edit,
    update: update,
    destroy: destroy
  };

};

exports['@singleton'] = true;
exports['@require'] = [ 'models/party' ];
