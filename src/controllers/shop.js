// All logic related to shop (what user sees)
const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const { ITEMS_PER_PAGE } = require('../utils/constants');

exports.getIndex = (req, res, next) => {
  // To make a number
  const page = +req.query.page || 1;
  let totalProducts;
  Product.find()
    .countDocuments()
    .then((numOfProds) => {
      totalProducts = numOfProds;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render('shop/index', {
        products: products,
        pageTitle: 'uBook - Home',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Product Controllers
exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;
  Product.find()
    .countDocuments()
    .then((numOfProds) => {
      totalProducts = numOfProds;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render('shop/product-list', {
        products: products,
        pageTitle: 'uBook - Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
        Product.findById(prod.productId).then((product) => {
          product.quantity = product.quantity - prod.quantity;

          return product.save();
        });
        // Returning all data related to product
        return {
          quantity: prod.quantity,
          product: {
            ...prod.productId._doc,
          },
        };
      });
      const order = new Order({
        user: {
          userId: req.user._id,
        },
        products: products,
        total: req.user.cart.total,
      });

      return order.save();
    })
    .then((result) => {
      req.user.clearCart();
      res.redirect('/orders');
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrderInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error('No order found'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized request'));
      }
      const invoiceName = orderId + '.pdf';
      const invoicePath = path.join('src', 'data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      // To open in browser
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true,
      });
      pdfDoc.text('-');
      order.products.forEach((prod) => {
        pdfDoc
          .fontSize(18)
          .text(
            `Title: ${prod.product.title} - Quantity: ${prod.quantity} x Price: ${prod.product.price} €`
          );
      });
      pdfDoc.fontSize(26).text('-');
      pdfDoc.fontSize(20).text(`Total price: ${order.total} €`);
      pdfDoc.end();

      // const file = fs.createReadStream(invoicePath);

      // /* Data will be downloaded by the browser step by step, not preloaded */
      // file.pipe(res);
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
