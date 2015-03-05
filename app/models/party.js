
// # party

var jsonSelect = require('mongoose-json-select');
var mongoosePaginate = require('mongoose-paginate');

exports = module.exports = function(mongoose, iglooMongoosePlugin) {

  var Party = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    partyCode: {
      type: String,
      required: true
    }
  });

  // virtuals
  Party.virtual('object').get(function() {
    return 'party';
  });

  // plugins
  //Party.plugin(jsonSelect, '-_group -salt -hash');
  Party.plugin(mongoosePaginate);

  // keep last
  Party.plugin(iglooMongoosePlugin);

  return mongoose.model('Party', Party);
};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/mongo', 'igloo/mongoose-plugin' ];
