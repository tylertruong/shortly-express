const models = require('../models');
const Promise = require('bluebird');
const utils = require('../lib/hashUtils');

module.exports.createSession = (req, res, next) => {
  //req.session = {hash: ''};

  if (Object.keys(req.cookies).length !== 0) {
    models.Sessions.get({hash: req.cookies.shortlyid})
      .then((data) => {
        req.session = data;
        next();
      });
  } else {
    models.Sessions.create()
      .then((result) => {
        models.Sessions.get({id: result.insertId})
        .then((data) => {
          console.log(data);
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
        res.status(200).send();
        next();
      } else {
        const options = {
          username: username,
          password: password,
        };
        models.Users.create(options);
        res.location('/');
        res.status(200).send();
        next();
      }
    });
};

module.exports.loginUser = (req, res, next) => {
  const {username, password} = req.body;
  models.Users.get({ username: username })
    .then((result) => {
      if (result) {
        if (utils.compareHash(password, result.password, result.salt)) {
          res.location('/');
          res.status(200).send();
          next();
        } else {
          res.location('/login');
          res.status(200).send();
          next();
        }
      } else {
        res.location('/login');
        res.status(200).send();
        next();
      }
    });
};