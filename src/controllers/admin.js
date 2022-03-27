// All logic related to admin

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'uBook - Admin',
    path: '/admin/products',
    editing: false,
    isAuthenticated:  req.session.isAuthenticated,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const author = req.body.author;
  const imgURL = req.body.imgURL;
  const description = req.body.description;
  const price = req.body.price;
  const quantity = req.body.quantity;
  const userId = req.user._id;

  const product = new Product({
    title: title,
    author: author,
    imgURL: imgURL,
    description: description,
    price: price,
    quantity: quantity,
    userId: userId,
    isAuthenticated: req.session.isAuthenticated,
  });

  product
    .save()
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
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
        path: '/admin/products',
        editing: editMode,
        isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const title = req.body.title;
  const author = req.body.author;
  const imgURL = req.body.imgURL;
  const description = req.body.description;
  const price = req.body.price;
  const quantity = req.body.quantity;
  const userId = req.user._id;

  Product.findById(productId)
    .then((product) => {
      product.title = title;
      product.author = author;
      product.imgURL = imgURL;
      product.description = description;
      product.price = price;
      product.quantity = quantity;
      product.userId = userId;
      return product.save();
    })
    .then((result) => res.redirect('/admin/products'))
    .catch((err) => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findByIdAndRemove(productId)
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('admin/products', {
        products: products,
        pageTitle: 'uBook - Admin',
        path: '/admin/products',
        isAuthenticated:  req.session.isAuthenticated,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
