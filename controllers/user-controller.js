const User = require('../models/user-model.js');
const passport = require('passport');
const jwtSecret = require('../config/jwt.js');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
    
    User.findOne({ 'username' : req.body.email }, async function(err, user) {
        if (err) {
            return res.status(500).send({ message: err.message});
        }
        
        if (user) {
            return res.status(500).send({message: "Email đã tồn tại."});
        }   
        
        var newUser = new User({
                email: req.body.email,
                password : req.body.password,
                displayname: req.body.displayname,
                gender:req.body.gender,
                dob:req.body.dob
        });

        newUser.save(function(err) {
                if (err)
                    throw err;
                return res.send(newUser);
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
                res.send(err);
            }
            console.log(passportUser.id);
            // generate a signed son web token with the contents of user object and return it in the response
            const token = jwt.sign({id: passportUser.id}, jwtSecret.secret);
            return res.json({token:token, auth: true});
        }); 
        return res.status(400).send({
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
            console.log(passportUser);
            return res.json({passportUser});
        }
        return res.status(400).send({
            message: "Đã có lỗi xảy ra."
        })
    })(req, res, next);
}