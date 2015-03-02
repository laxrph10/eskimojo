
// # tests - songs

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

describe('/songs', function() {

  var Song = IoC.create('models/song');

  // Clean DB and add 3 sample songs before tests start
  before(function(done) {
    async.waterfall([
      utils.cleanDatabase,
      function createTestSongs(callback) {
        // Create 3 test songs
        async.timesSeries(3, function(i, _callback) {
          var song = new Song({
            name: 'Song #' + i
          });

          song.save(_callback);
        }, callback);
      }
    ], done);
  });

  // Clean DB after all tests are done
  after(function(done) {
    utils.cleanDatabase(done);
  });

  it('POST /songs - should return 200 if song was created', function(done) {
    request
      .post('/songs')
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
        context.songsIdCreatedWithRequest = res.body.id;

        done();
      });
  });

  it('GET /songs/:id — should return 200 if songs was retrieved', function(done) {
    request
      .get(util.format('/songs/%s', context.songsIdCreatedWithRequest))
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

  it('PUT /songs/:id - should return 200 if songs was updated', function(done) {
    request
      .put(util.format('/songs/%s', context.songsIdCreatedWithRequest))
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

  it('DELETE /songs/:id - should return 200 if songs was deleted', function(done) {
    request
      .del(util.format('/songs/%s', context.songsIdCreatedWithRequest))
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
        res.body.id.should.equal(context.songsIdCreatedWithRequest);
        res.body.deleted.should.equal(true);

        done();
      });
  });

  it('GET /songs - should return 200 if songs index loads (JSON)', function(done) {
    request
      .get('/songs')
      .accept('application/json')
      .expect(200, done);
  });
  
  it('GET /songs - should return 200 if songs index loads and shows 3 rows (HTML)', function(done) {
    request
      .get('/songs')
      .accept('text/html')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.text).to.exist;

        var $ = cheerio.load(res.text)
        var $songList = $('table');
        var $songRows = $songList.find('tr');

        // Test the values make sense
        $songList.should.have.length.of(1);
        $songRows.should.have.length.of.at.least(3);

        done();
      });
  });


});