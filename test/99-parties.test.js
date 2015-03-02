
// # tests - parties

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

describe('/parties', function() {

  var Party = IoC.create('models/party');

  // Clean DB and add 3 sample parties before tests start
  before(function(done) {
    async.waterfall([
      utils.cleanDatabase,
      function createTestParties(callback) {
        // Create 3 test parties
        async.timesSeries(3, function(i, _callback) {
          var party = new Party({
            name: 'Party #' + i
          });

          party.save(_callback);
        }, callback);
      }
    ], done);
  });

  // Clean DB after all tests are done
  after(function(done) {
    utils.cleanDatabase(done);
  });

  it('POST /parties - should return 200 if party was created', function(done) {
    request
      .post('/parties')
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
        context.partiesIdCreatedWithRequest = res.body.id;

        done();
      });
  });

  it('GET /parties/:id — should return 200 if parties was retrieved', function(done) {
    request
      .get(util.format('/parties/%s', context.partiesIdCreatedWithRequest))
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

  it('PUT /parties/:id - should return 200 if parties was updated', function(done) {
    request
      .put(util.format('/parties/%s', context.partiesIdCreatedWithRequest))
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

  it('DELETE /parties/:id - should return 200 if parties was deleted', function(done) {
    request
      .del(util.format('/parties/%s', context.partiesIdCreatedWithRequest))
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
        res.body.id.should.equal(context.partiesIdCreatedWithRequest);
        res.body.deleted.should.equal(true);

        done();
      });
  });

  it('GET /parties - should return 200 if parties index loads (JSON)', function(done) {
    request
      .get('/parties')
      .accept('application/json')
      .expect(200, done);
  });
  
  it('GET /parties - should return 200 if parties index loads and shows 3 rows (HTML)', function(done) {
    request
      .get('/parties')
      .accept('text/html')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.text).to.exist;

        var $ = cheerio.load(res.text)
        var $partyList = $('table');
        var $partyRows = $partyList.find('tr');

        // Test the values make sense
        $partyList.should.have.length.of(1);
        $partyRows.should.have.length.of.at.least(3);

        done();
      });
  });


});