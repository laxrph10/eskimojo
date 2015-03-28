
// # tests - searches

var util = require('util');
var request = require('supertest');
var app = require('../app');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var utils = require('./utils');
var async = require('async');
var IoC = require('electrolyte');
var cheerio = require('cheerio');

chai.should();
chai.use(sinonChai);

request = request(app);

// storage for context-specific variables throughout the tests
var context = {};

describe('/searches', function() {

  var Search = IoC.create('models/search');

  // Clean DB and add 3 sample searches before tests start
  before(function(done) {
    async.waterfall([
      utils.cleanDatabase,
      function createTestSearches(callback) {
        // Create 3 test searches
        async.timesSeries(3, function(i, _callback) {
          var search = new Search({
            name: 'Search #' + i
          });

          search.save(_callback);
        }, callback);
      }
    ], done);
  });

  // Clean DB after all tests are done
  after(function(done) {
    utils.cleanDatabase(done);
  });

  it('POST /searches - should return 200 if search was created', function(done) {
    request
      .post('/searches')
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .send({
        name: 'Nifty',
      })
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist
        res.body.should.have.property('id');
        res.body.should.have.property('name');

        // Test the values make sense
        res.body.name.should.equal('Nifty');

        // Store this id to use later
        context.searchesIdCreatedWithRequest = res.body.id;

        done();
      });
  });

  it('GET /searches/:id — should return 200 if searches was retrieved', function(done) {
    request
      .get(util.format('/searches/%s', context.searchesIdCreatedWithRequest))
      .accept('application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('name');

        // Test the values make sense
        res.body.name.should.equal('Nifty');

        done();
      });
  });

  it('PUT /searches/:id - should return 200 if searches was updated', function(done) {
    request
      .put(util.format('/searches/%s', context.searchesIdCreatedWithRequest))
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .send({
        name: 'NiftyWhoa'
      })
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('name');

        // Test the values make sense
        res.body.name.should.equal('NiftyWhoa');

        done();
      });
  });

  it('DELETE /searches/:id - should return 200 if searches was deleted', function(done) {
    request
      .del(util.format('/searches/%s', context.searchesIdCreatedWithRequest))
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('deleted');

        // Test the values make sense
        res.body.id.should.equal(context.searchesIdCreatedWithRequest);
        res.body.deleted.should.equal(true);

        done();
      });
  });

  it('GET /searches - should return 200 if searches index loads (JSON)', function(done) {
    request
      .get('/searches')
      .accept('application/json')
      .expect(200, done);
  });
  
  it('GET /searches - should return 200 if searches index loads and shows 3 rows (HTML)', function(done) {
    request
      .get('/searches')
      .accept('text/html')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.text).to.exist;

        var $ = cheerio.load(res.text)
        var $searchList = $('table');
        var $searchRows = $searchList.find('tr');

        // Test the values make sense
        $searchList.should.have.length.of(1);
        $searchRows.should.have.length.of.at.least(3);

        done();
      });
  });


});