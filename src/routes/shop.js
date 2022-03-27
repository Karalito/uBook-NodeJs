const express = require('express');

const router = express.Router();

const {
  getIndex,
  getProducts,
  getProduct,
  getCart,
  postCart,
  postDeleteCartProduct,
  clearCart,
  getOrders,
  postOrder,
} = require('../controllers/shop');

const isAuth = require('../middleware/is-auth');

router.get('/', getIndex);

// Product routes
router.get('/products', getProducts);
router.get('/products/:productId', getProduct);

// Order routes
router.get('/orders', isAuth, getOrders);
router.post('/create-order', isAuth, postOrder);

// Cart routes
router.get('/cart', isAuth, getCart);
router.post('/cart', isAuth, postCart);
router.post('/cart-delete-item', isAuth, postDeleteCartProduct);
router.post('/clear-cart', isAuth, clearCart);
// // Checkout routes
// router.get('/checkout', getCheckout);

module.exports = router;
