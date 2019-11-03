const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const User = require('../models/user-model.js');
const jwtSecret = require('./jwt.js');

module.exports = function(passport) {

    passport.use('local-login', new LocalStrategy({
            email: 'email',
            password: 'password'
        }, 
        function (email, password, done) {
            //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
            return User.findOne({email, password}).then(user => {
                if (!user) {
                    return done(null, false, {message: 'Tài khoản hoặc mật khẩu sai.'});
                }
                return done(null, user, {message: 'Đăng nhập thành công'});
            }).catch(err => done(err));
        }
    ));

    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('jwt'),
        secretOrKey   : jwtSecret.secret
    },
    function (jwtPayload, done) {
        return User.findById(jwtPayload.id)
            .then(user => {
                if(user) {
                    return done(null, user);
                }
                else {
                    return done(null, false);
                }
            })
            .catch(err => {
                return done(err);
            });
    }
    ));
}