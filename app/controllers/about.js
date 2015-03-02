// # about

exports = module.exports = function() {

  function about(req, res, next) {
    res.format({
      html: function() {
        res.render('about');
      },
      json: function() {
        res.status(200).end();
      }
    });
  }

  return about;

};

exports['@singleton'] = true;
