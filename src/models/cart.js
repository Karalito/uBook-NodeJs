const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');

const directory = path.join(rootDir, 'src/data', 'cart.json');

module.exports = class Cart {
  static addProduct(productId, productPrice) {
    // Getting prev cart
    fs.readFile(directory, (error, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!error) {
        cart = JSON.parse(fileContent);
      }
      // Checking if item exists in cart
      const productIndex = cart.products.findIndex((p) => p.id === productId);
      const existingProduct = cart.products[productIndex];
      let updatedProduct;
      // Adding new book + increasing qty
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[productIndex] = updatedProduct;
      } else {
        updatedProduct = { id: productId, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      // +productPrice to convert string to number
      cart.totalPrice = (cart.totalPrice * 10 + productPrice * 10) / 10;
      fs.writeFile(directory, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static deleteCartProduct(productId, productPrice) {
    fs.readFile(directory, (error, fileContent) => {
      if (error) {
        return;
      }
      const updatedCart = { ...JSON.parse(fileContent) };
      const product = updatedCart.products.find((p) => p.id === productId);

      if (!product) return;

      const productQty = product.qty;
      
      updatedCart.products = updatedCart.products.filter(
        (p) => p.id !== productId
      );
      updatedCart.totalPrice =
        (updatedCart.totalPrice * 10 - productPrice * 10 * productQty) / 10;
      fs.writeFile(directory, JSON.stringify(updatedCart), (err) => {
        console.log(err);
      });
    });
  }

  static fetchCart(callBack) {
    fs.readFile(directory, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) callBack(null);
      else callBack(cart);
    });
  }
};
