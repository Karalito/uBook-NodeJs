const bcrypt = require('bcryptjs');

const User = require('../models/user');
// Login
exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'uBook - Login',
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isAuthenticated = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password');
          res.redirect('/login');
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

// Register
exports.getRegister = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/register', {
    path: '/register',
    pageTitle: 'uBook - Register',
    errorMessage: message,
  });
};

exports.postRegister = (req, res, next) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  if (!firstname || !lastname || !email || !password || !password2) {
    req.flash('error', 'Fill in all fields !');
    return res.redirect('/register');
  } else {
    if (password !== password2) {
      req.flash('error', 'Passwords must match !');
      return res.redirect('/register');
    } else {
      User.findOne({ email: email })
        .then((user) => {
          if (user) {
            req.flash(
              'error',
              'User with this Email already exists, please provide different one.'
            );
            return res.redirect('/register');
          }
          // Implement username check aswell
          return bcrypt
            .hash(password, 12)
            .then((hashedPassword) => {
              const user = new User({
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: hashedPassword,
                cart: { items: [], total: 0 },
              });
              return user.save();
            })
            .then((result) => {
              req.flash(
                'success',
                'User is successfully created. You may now login.'
              );
              res.redirect('/login');
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
};
