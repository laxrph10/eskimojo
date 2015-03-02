// # routes - about

exports = module.exports = function(IoC) {

  var app = this;

  app.get('/about', IoC.create('controllers/about'));

};

exports['@require'] = [ '$container' ];
exports['@singleton'] = true;
