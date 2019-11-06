const User = require('../models/user-model.js');
const passport = require('passport');
const jwtSecret = require('../config/jwt.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.register = (req, res) => {
    
    User.findOne({'email' : req.body.email }, async function(err, user) {
        if (err) {
            return res.status(500).json({message: err.message});
        }
        
        if (user) {
            return res.status(500).json({message: "Email đã tồn tại, vui lòng thay đổi email!"});
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

    passport.authenticate('local-login', { session: false }, (err, passportUser, message) => {
        if (err) {
            return next(err);
        }
        if(passportUser) {
            req.login(passportUser, {session: false}, (err) => {
                if (err) {
                    return res.send(err);
                }
                //console.log(passportUser);
                // generate a signed son web token with the contents of user object and return it in the response
                const token = jwt.sign({id: passportUser.id}, jwtSecret.secret);
                return res.json({user: passportUser, token});
            });
        }
        return res.status(500).json({
            message: message.message
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
        return res.status(500).json({
            message: "Đã có lỗi xảy ra, vui lòng thử lại!"
        });
    })(req, res, next);
}

exports.update = (req,res,next) => {
    User.findByIdAndUpdate(req.body._id, {$set: {displayname: req.body.displayname}})
      .exec( function(err, result) {
        if(err) {
            return res.status(500).json({
                message: "Đã có lỗi xảy ra, không thể cập nhật thông tin!" 
            });
        }
        else {
            User.findOne({'_id': req.body._id}, async function(err, user) 
            {
                if (err) {
                    return res.status(500).json({
                        message: "Đã có lỗi xảy ra, không thể cập nhật thông tin!" 
                    });
                }
                
                if (user) {
                    return res.json({user, message: "Cập nhật thông tin thành công!"});
                } 
            })
        }
      });
}

exports.changepass = (req,res,next) => {
    User.findOne({'_id': req.body._id}, async function(err, result){
        if(err) {
            res.status(500).json({
                message: "Đã có lỗi xảy ra, không thể thể đổi mật khẩu!" 
            })
        }

        var test = await bcrypt.compare(req.body.passpresent, result.password);

        if(!test)
        {
            return res.status(500).json({message: "Mật khẩu hiện tại không đúng. Vui lòng thử lại!"});
        }

        else {
          var password = await bcrypt.hash(req.body.password, 10);
          await User.findByIdAndUpdate(req.body._id, {$set: {password: password}}).exec(function(err,result){
            if(err) {
                return res.status(500).json({
                    message: "Đã có lỗi xảy ra, không thể thay đổi mật khẩu!" 
                });
            }
            return res.json({
                message: "Đổi mật khẩu thành công!" 
            });
          }); 
        }
      })
}

exports.loginFacebook = (req, res) => {
    passport.authenticate('login-facebook', { session: false }, (profile) => {
        if (!profile) {
            return res.redirect('https://hw3-caro-game-update.herokuapp.com/login');
        }
        User.findOne({ facebookId: profile.id }, (err, user) => {

            if (err) {
                return res.status(500).json({
                    message: "Đã có lỗi xảy ra, không thể đăng nhập!" 
                });
            }
            if (user) {
                const token = jwt.sign({id: user.id}, jwtSecret.secret);
                return res.redirect(`https://hw3-caro-game-update.herokuapp.com/login?token=${{user, token}}`);
            }
            else {
                const userFacebook = new User({
                    displayname: profile.displayname,
                    facebookId: profile.id,
                    email: profile.email,
                })
                userFacebook.save(function(err) {
                    if (err)
                        throw err;
                    const token = jwt.sign({id: userFacebook.id}, jwtSecret.secret);
                    return res.redirect(`https://hw3-caro-game-update.herokuapp.com/login?token=${{user: userFacebook, token}}`);
                });
            }
        })
    })(req, res);
}

exports.loginGoogle = (req, res) => {
    console.log("login...");
    passport.authenticate('google', { session: false }, (profile) => {
        if (!profile) {
            return res.redirect('https://hw3-caro-game-update.herokuapp.com/login');
        }
        User.findOne({ googleId: profile.id }, (err, user) => {

            if (err) {
                return res.status(500).json({
                    message: "Đã có lỗi xảy ra, không thể đăng nhập!" 
                });
            }
            if (user) {
                const token = jwt.sign({id: user.id}, jwtSecret.secret);
                return res.redirect(`https://hw3-caro-game-update.herokuapp.com/login?token=${{user, token}}`);
            }
            else {
                const userGoogle = new User({
                    email: profile.email,
                    displayname: profile.displayname,
                    googleId: profile.id,
                })

                userGoogle.save(function(err) {
                    if (err)
                        throw err;
                    const token = jwt.sign({id: userGoogle.id}, jwtSecret.secret);
                    return res.redirect(`https://hw3-caro-game-update.herokuapp.com/login?token=${{user: userGoogle, token}}`);
                });
            }
        })
    })(req, res);
}