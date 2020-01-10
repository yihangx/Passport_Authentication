let express = require("express");
let router = express.Router();
let bcrypt = require('bcryptjs');
let passport = require('passport');
let User = require('../models/User');
router.get('/login', (req, res) => res.render("login"));
router.get('/register', (req, res) => res.render("register"));
router.post('/register', (req, res) => {
  let { name, email, password, password2 } = req.body;
  let errors = [];
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields"});
  }
  if (password != password2) {
    errors.push({ msg: "Passwords do not match"});
  }
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters!"});
  }
  if (errors.length > 0){
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email = email})
      .then(user => {
          if(user) {
            errors.push({ msg: "Email is already registered."})
            res.render('register',{
              errors,
              name,
              email,
              password,
              password2
            });
          } else {
            let newUser = new User({
              name,
              email,
              password
            });
          bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) =>{
              if (err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  req.flash('success_msg', "You are now registered.");
                  res.redirect('./login');
                })
                .catch(err => console.log(err));
          }))
          }
      });
  }
});
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});
module.exports = router;
