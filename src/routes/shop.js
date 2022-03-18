const express = require('express');

const router = express.Router();

const shopController = require('../controllers/shop');

router.get('/', shopController.getIndex);

// Product routes
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);

// Order routes
router.get('/orders', shopController.getOrders);

// Cart routes
router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);

// Checkout routes
router.get('/checkout', shopController.getCheckout);

module.exports = router;
