
// # song

var jsonSelect = require('mongoose-json-select');
var mongoosePaginate = require('mongoose-paginate');

exports = module.exports = function(mongoose, iglooMongoosePlugin) {

  var Song = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    artist: {
      type: String,
      required: true
    }
  });

  // virtuals
  Song.virtual('object').get(function() {
    return 'song';
  });

  // plugins
  //Song.plugin(jsonSelect, '-_group -salt -hash');
  Song.plugin(mongoosePaginate);

  // keep last
  Song.plugin(iglooMongoosePlugin);

  return mongoose.model('Song', Song);
};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/mongo', 'igloo/mongoose-plugin' ];
