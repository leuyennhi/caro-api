var express = require('express');

const users = require('../controllers/user-controller.js');
const passport = require('passport');

module.exports = function(app, passport) {
  app.post('/user/register', users.register);
  app.post('/user/login', users.login);
  app.get('/user/me',users.me);
  app.post('/user/update', users.update);
  app.post('/user/changepass', users.changepass);
  app.get('/login/facebook', passport.authenticate('login-facebook', { scope: ['email'] }));
  app.get('/login/facebook/callback', users.loginFacebook);
  app.get('/login/google', passport.authenticate('login-google', { scope: ['profile', 'email'] }));
  app.get('/login/google/callback', users.loginGoogle);
}
