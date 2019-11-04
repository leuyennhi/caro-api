const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const User = require('../models/user-model.js');
const jwtSecret = require('./jwt.js');
const bcrypt = require('bcrypt');

module.exports = function(passport) {

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
        }, 
        function (email, password, done) {
            
            return User.findOne({email}, async function(err, user) {
                if (err)
                    return done(err);

                if (!user) {
                    return done(null, false, {message: "Tài khoản không tồn tại"});
                }

                if(!await bcrypt.compare(password, user.password)) {
                    return done(null, false, {message: "Mật khẩu không đúng"});
                }

                return done(null, user, {message: "Đăng nhập thành công"});
            });
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