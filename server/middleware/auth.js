const models = require('../models');
const Promise = require('bluebird');
const utils = require('../lib/hashUtils');

module.exports.createSession = (req, res, next) => {
  if (req.cookies && Object.keys(req.cookies).length !== 0) {
    models.Sessions.get({hash: req.cookies.shortlyid})
      .then((data) => {
        if (data) {
          req.session = data;
          next();
        } else {
          models.Sessions.create() 
            .then((result) => {
              models.Sessions.get({id: result.insertId})
                .then((data) => {
                  req.session = {hash: data.hash};
                  res.cookie('shortlyid', data.hash);
                  next();
                }); 
            });
        }
      });
  } else {
    models.Sessions.create()
      .then((result) => {
        models.Sessions.get({id: result.insertId})
          .then((data) => {
            req.session = {hash: data.hash};
            res.cookie('shortlyid', data.hash);
            next();
          }); 
      });
  }

};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.createUser = (req, res, next) => {
  const {username, password} = req.body;
  models.Users.get({ username: username })
    .then((result) => {
      if (result) {
        res.location('/signup');
        next();
      } else {
        const options = {
          username: username,
          password: password,
        };
        models.Users.create(options)
          .then (data => {
            models.Users.get({username: username})
              .then(data => {
                models.Sessions.update({hash: req.session.hash}, {userId: data.id});
                res.redirect('/');
                next();
              });
          });
      }
    });
};

module.exports.loginUser = (req, res, next) => {
  const {username, password} = req.body;
  models.Users.get({ username: username })
    .then((result) => {
      if (result) {
        if (utils.compareHash(password, result.password, result.salt)) {
          res.redirect('/');
          next();
        } else {
          res.redirect('/login');
          next();
        }
      } else {
        res.redirect('/login');
        next();
      }
    });
};


module.exports.logoutUser = (req, res, next) => {
  models.Sessions.delete({ hash: req.cookies.shortlyid })
    .then(() => {
      next();
    });
};