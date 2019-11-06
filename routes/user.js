var express = require('express');

const users = require('../controllers/user-controller.js');

module.exports = function(app, passport) {
  app.post('/user/register', users.register);
  app.post('/user/login', users.login);
  app.get('/user/me',users.me);
  app.post('/user/update', users.update);
  app.post('/user/changepass', users.changepass);
}
