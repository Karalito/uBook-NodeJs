// All logic related to shop (what user sees)

const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
  Product.find().then((products) => {
    res.render('shop/product-list', {
      products: products,
      pageTitle: 'uBook - Home',
      path: '/',
    });
  });
};

// Product Controllers
exports.getProducts = (req, res, next) => {
  Product.find().then((products) => {
    res.render('shop/product-list', {
      products: products,
      pageTitle: 'uBook - Products',
      path: '/products',
    });
  });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId).then((product) => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: `uBook - ${product.title}`,
      path: '/products/:id',
    });
  });
};

// Order Controllers
exports.getOrders = (req, res, next) => {
  // Getting orders that are of users id
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'uBook - Your Orders',
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items.map((prod) => {
        // Returning all data related to product
        return { quantity: prod.quantity, product: { ...prod.productId._doc } };
      });
      const order = new Order({
        user: {
          userId: req.user._id,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      req.user.clearCart();
      res.redirect('/orders');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.clearCart = (req, res, next) => {
  req.user
    .clearCart()
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
// Cart Controllers

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items;
      const total = user.cart.total;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'uBook - Cart',
        products: products,
        total: total,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteCartProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      req.user
        .deleteFromCart(product)
        .then((result) => res.redirect('/cart'))
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Checkout Controllers
exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'uBook - Checkout',
  });
};
