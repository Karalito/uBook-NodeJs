// All logic related to shop (what user sees)

const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('shop/index', {
      products: products,
      pageTitle: 'uBook - Index',
      path: '/',
    });
  });
};

// Product Controllers
exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('shop/product-list', {
      products: products,
      pageTitle: 'uBook - Products',
      path: '/products',
    });
  });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.fetchById(productId, (product) => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: `uBook - ${product.title}`,
      path: '/products/:id',
    });
  });
};

// Order Controllers
exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'uBook - Orders',
  });
};

// Cart Controllers
exports.getCart = (req, res, next) => {
  Cart.fetchCart((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      for (product of products) {
        const cartProductData = cart.products.find((p) => p.id === product.id);
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'uBook - Cart',
        products: cartProducts,
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.fetchById(productId, (product) => {
    Cart.addProduct(productId, product.price);
  });
  res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.fetchById(productId, (product) => {
    Cart.deleteCartProduct(productId, product.price);
    res.redirect('/cart');
  });
};

// Checkout Controllers
exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'uBook - Checkout',
  });
};
