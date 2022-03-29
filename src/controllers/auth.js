require('dotenv').config();

const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_user: SENDGRID_API_KEY,
    },
  })
);

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
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'uBook - Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isAuthenticated = true;
            req.session.user = user;
            req.session.isAdmin = user.isAdmin;
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
            });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'uBook - Login',
            errorMessage: 'Invalid email or password',
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
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
    oldInput: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      password2: '',
    },
    validationErrors: [],
  });
};

exports.postRegister = (req, res, next) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/register', {
      path: '/register',
      pageTitle: 'uBook - Register',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
        password2: password2,
      },
      validationErrors: errors.array(),
    });
  }
  if (!firstname || !lastname || !email || !password || !password2) {
    req.flash('error', 'Fill in all fields !');
    return res.redirect('/register');
  } else {
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
        return transporter
          .sendMail({
            to: email,
            from: 's036803@ad.viko.lt',
            subject: 'Registered Successfully',
            html: '<h1>You Successfully Signed Up to <a href="http://127.0.0.1:8070">uBook</a></h1>',
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

// Account recovery

exports.getRecover = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/recover-account', {
    path: '/recover-account',
    pageTitle: 'Account Recovery',
    errorMessage: message,
  });
};

exports.postRecover = (req, res, next) => {
  const userEmail = req.body.email;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/recover-account');
    }

    const token = buffer.toString('hex');

    User.findOne({ email: userEmail })
      .then((user) => {
        if (!user) {
          req.flash('error', "Account with provided Email doesn't exist!");
          return res.redirect('/recover-account');
        }
        user.resetToken = token;
        // Using miliseconds 30min
        user.resetTokenExpires = Date.now() + 1800000;

        return user.save();
      })
      .then((result) => {
        req.flash('error', 'Check your Email for further instructions');
        res.redirect('/recover-account');
        transporter.sendMail({
          to: userEmail,
          from: 's036803@ad.viko.lt',
          subject: 'Password reset',
          html: `
          <p>You have requested to reset your uBook password.</p>
          <p>If you don't want to change your password Ignore this email, otherwise proceed.</p>
          <p>Click this <a href="http://localhost:8070/reset-password/${token}">LINK</a> to set a new password.<p/>
          <p>Or paste this link into your browser: http://localhost:8070/reset-password/${token} </p>
          <p>Important! Password recovery link expires after 30 minutes!</p>
          `,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getResetPassword = (req, res, next) => {
  const token = req.params.token;
  // $gt is greater than
  User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/reset-password', {
        path: '/reset-password',
        pageTitle: 'Reset Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postResetPassword = (req, res, next) => {
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/reset-password', {
      path: `/reset-password/${passwordToken}`,
      pageTitle: 'Reset Password',
      errorMessage: errors.array()[0].msg,
      userId: userId,
      passwordToken: passwordToken,
    });
  }

  const password = req.body.password;

  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpires: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpires = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => {
      console.log(err);
    });
};
