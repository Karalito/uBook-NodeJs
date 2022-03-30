// All logic related to admin
const { validationResult } = require('express-validator');
const fileHelper = require('../utils/file');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'uBook - Admin',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const author = req.body.author;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  const quantity = req.body.quantity;
  const userId = req.user._id;
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: `uBook - Add Product`,
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        author: author,
        description: description,
        price: price,
        quantity: quantity,
        userId: userId,
      },
      errorMessage: 'Attached file is not an image!',
      validationErrors: [],
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: `uBook - Add Product`,
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        author: author,
        description: description,
        price: price,
        quantity: quantity,
        userId: userId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const imgURL = '/' + image.path;
  const product = new Product({
    title: title,
    author: author,
    image: imgURL,
    description: description,
    price: price,
    quantity: quantity,
    userId: userId,
  });

  product
    .save()
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) res.redirect('/');

  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      res.render('admin/edit-product', {
        product: product,
        pageTitle: `uBook - Edit ${product.title}`,
        path: '/admin/edit-product',
        editing: editMode,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const title = req.body.title;
  const author = req.body.author;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  const quantity = req.body.quantity;
  const userId = req.user._id;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: `uBook - Edit ${title}`,
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        _id: productId,
        title: title,
        author: author,
        description: description,
        price: price,
        quantity: quantity,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(productId)
    .then((product) => {
      product.title = title;
      product.author = author;
      product.description = description;
      product.price = price;
      product.quantity = quantity;
      product.userId = userId;

      if (image) {
        fileHelper.deleteFile(product.image);
        product.image = '/' + image.path;
      }

      return product.save().then((result) => res.redirect('/admin/products'));
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      if (!product) {
        return next(new Error('Product was not found.'));
      }
      fileHelper.deleteFile(product.image);
      return Product.findByIdAndRemove(productId);
    })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('admin/products', {
        products: products,
        pageTitle: 'uBook - Admin',
        path: '/admin/products',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
