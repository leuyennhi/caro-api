const User = require('../models/user-model.js');
const passport = require('passport');
const jwtSecret = require('../config/jwt.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.register = (req, res) => {
    
    User.findOne({ 'email' : req.body.email }, async function(err, user) {
        if (err) {
            return res.status(500).json({message: err.message});
        }
        
        if (user) {
            return res.status(500).json({message: "Email đã tồn tại."});
        }   
        
        var newUser = new User({
                email: req.body.email,
                password : await bcrypt.hash(req.body.password, 10),
                displayname: req.body.displayname
        });

        newUser.save(function(err) {
                if (err)
                    throw err;
                return res.json({user: newUser});
        });
    });
}

exports.login = (req, res, next) => {

    passport.authenticate('local-login', { session: false }, (err, passportUser) => {
        if (err) {
            return next(err);
        }
        req.login(passportUser, {session: false}, (err) => {
            if (err) {
                return res.send(err);
            }
            //console.log(passportUser);
            // generate a signed son web token with the contents of user object and return it in the response
            const token = jwt.sign({id: passportUser.id}, jwtSecret.secret);
            return res.json({user: passportUser, token});
        }); 
        return res.status(400).json({
            message: "Đã có lỗi xảy ra. Đăng nhập thất bại."
        });
    })(req, res, next);
}

exports.me = (req, res, next) => {
    passport.authenticate('jwt', {session:false}, (err, passportUser) => {
        if (err) {
            return next(err);
        }
        if (passportUser) {
            return res.json({user: passportUser});
        }
        return res.status(400).json({
            message: "Đã có lỗi xảy ra."
        })
    })(req, res, next);
}