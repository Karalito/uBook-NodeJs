const express = require('express');

const {
  getLogin,
  postLogin,
  postLogout,
  getRegister,
  postRegister,
} = require('../controllers/auth');

const router = express.Router();

router.get('/login', getLogin);
router.post('/login', postLogin);
router.post('/logout', postLogout);

router.get('/register', getRegister);
router.post('/register', postRegister);
module.exports = router;
