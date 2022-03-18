// All logic related to admin

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'uBook - Admin',
    path: '/admin/products',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const author = req.body.author;
  const imgURL = req.body.imgURL;
  const description = req.body.description;
  const price = req.body.price;
  // Setting id to null due to save serving as update aswell
  const product = new Product(null, title, author, imgURL, description, price);
  product.save();
  res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) res.redirect('/');

  const productId = req.params.productId;
  Product.fetchById(productId, (product) => {
    if (!product) res.redirect('/');
    res.render('admin/edit-product', {
      product: product,
      pageTitle: `uBook - Edit ${product.title}`,
      path: '/admin/products',
      editing: editMode,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  console.log(req.body.productId);
  const productId = req.body.productId;
  const title = req.body.title;
  const author = req.body.author;
  const imgURL = req.body.imgURL;
  const description = req.body.description;
  const price = req.body.price;
  const updatedProduct = new Product(
    productId,
    title,
    author,
    imgURL,
    description,
    price
  );
  updatedProduct.save();
  res.redirect('/admin/products');
};

exports.deleteProduct = (req,res, next) =>{
  const productId = req.body.productId;
  Product.deleteProductById(productId)
  res.redirect('/admin/products');
}
exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('admin/products', {
      products: products,
      pageTitle: 'uBook - Admin',
      path: '/admin/products',
    });
  });
};
