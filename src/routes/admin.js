const express = require('express');

const router = express.Router();

const {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  deleteProduct,
  getProducts,
} = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');

router.get('/add-product', isAuth, isAdmin, getAddProduct);
router.post('/add-product', isAuth, isAdmin, postAddProduct);

router.get('/edit-product/:productId', isAuth, isAdmin, getEditProduct);
router.post('/edit-product', isAuth, isAdmin, postEditProduct);
router.post('/delete-product', isAuth, isAdmin, deleteProduct);

router.get('/products', isAuth, isAdmin, getProducts);

module.exports = router;
