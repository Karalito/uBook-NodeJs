const express = require('express');

const { body } = require('express-validator');

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
router.post(
  '/add-product',
  isAuth,
  isAdmin,
  [
    body('title', 'Title can only contain Letters and Numbers')
      .matches(/^[a-zA-Z0-9\s]*$/)
      .trim(),
    body('author', 'Author can only contain Letters')
      .matches(/^[A-Za-z\s]*$/)
      .trim(),
    body('imgURL', 'Image must be url.').isURL(),
    body('description', 'Description cant be longer than 500 Characters')
      .isLength({ max: 500 })
      .trim(),
    body(
      'price',
      'Price cannot include anything but numbers and must be maximum of two decimal palces ex: 1.50'
    ).matches(/^\d*(\.\d{0,2})?$/),
    body('quantity', 'Quantity must be numeric only (0-1000)')
      .isNumeric()
      .matches(/^([0-9][0-9]{0,2}|1000)$/),
  ],
  postAddProduct
);

router.get('/edit-product/:productId', isAuth, isAdmin, getEditProduct);
router.post(
  '/edit-product',
  isAuth,
  isAdmin,
  [
    body('title', 'Title can only contain Letters and Numbers')
      .matches(/^[a-zA-Z0-9\s]*$/)
      .trim(),
    body('author', 'Author can only contain Letters')
      .matches(/^[A-Za-z\s]*$/)
      .trim(),
    body('imgURL', 'Image must be url.').isURL(),
    body('description', 'Description cant be longer than 500 Characters')
      .isLength({ max: 500 })
      .trim(),
    body(
      'price',
      'Price cannot include anything but numbers and must be maximum of two decimal palces ex: 1.50'
    ).matches(/^\d*(\.\d{0,2})?$/),
    body('quantity', 'Quantity must be numeric only (0-1000)')
      .isNumeric()
      .matches(/^([0-9][0-9]{0,2}|1000)$/),
  ],
  postEditProduct
);
router.post('/delete-product', isAuth, isAdmin, deleteProduct);

router.get('/products', isAuth, isAdmin, getProducts);

module.exports = router;
