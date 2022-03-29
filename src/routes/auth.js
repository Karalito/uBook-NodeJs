const express = require('express');
const { body } = require('express-validator');

const {
  getLogin,
  postLogin,
  postLogout,
  getRegister,
  postRegister,
  getRecover,
  postRecover,
  getResetPassword,
  postResetPassword,
} = require('../controllers/auth');

const User = require('../models/user');

const router = express.Router();

// Login routes
router.get('/login', getLogin);
router.post(
  '/login',
  [
    body('email', 'Enter valid email address')
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject('Invalid email or password');
          }
        });
      }),
  ],
  postLogin
);
router.post('/logout', postLogout);

// Register routes
router.get('/register', getRegister);
router.post(
  '/register',
  [
    body('email', 'Enter valid email address')
      .isEmail()
      .custom((value, { req }) => {
        //
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            // Throwing error inside a prommise
            return Promise.reject(
              'User with this Email already exists, please pick different one.'
            );
          }
        });
      }),
    body('password', 'Password must contain atleast 8 characters!')
      .isLength({
        min: 8,
      })
      .trim(),
    body('password2')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password)
          throw new Error('Passwords must match!');
        return true;
      }),
  ],
  postRegister
);

// Password recovery routes
router.get('/recover-account', getRecover);
router.post('/recover-account', postRecover);

// Password reset routes
router.get('/reset-password/:token', getResetPassword);
router.post(
  '/reset-password',
  [
    body('password', 'Password must contain atleast 8 characters!')
      .isLength({
        min: 8,
      })
      .trim(),
    body('password2')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password)
          throw new Error('Passwords must match!');
        return true;
      }),
  ],
  postResetPassword
);
module.exports = router;
