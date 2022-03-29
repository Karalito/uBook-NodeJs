const express = require('express');

const {
  getLogin,
  postLogin,
  postLogout,
  getRegister,
  postRegister,
  getRecover,
  postRecover,
} = require('../controllers/auth');

const router = express.Router();

// Login routes
router.get('/login', getLogin);
router.post('/login', postLogin);
router.post('/logout', postLogout);

// Register routes
router.get('/register', getRegister);
router.post('/register', postRegister);

// Password recovery routes
router.get('/recover-account', getRecover);
router.post('/recover-account', postRecover);

// Password reset routes
router.get('/reset-password');
router.post('/reset-password');
module.exports = router;
