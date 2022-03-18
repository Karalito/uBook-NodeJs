const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');

const Cart = require('./cart');

const directory = path.join(rootDir, 'src/data', 'products.json');

const getProductsFromFile = (callBack) => {
  fs.readFile(directory, (err, fileContent) => {
    if (err) {
      callBack([]);
    } else {
      callBack(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, author, imgURL, description, price) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.imgURL = imgURL;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      // For updating product
      if (this.id) {
        const productIndex = products.findIndex((p) => p.id === this.id);
        const updatedProducts = [...products];
        updatedProducts[productIndex] = this;
        fs.writeFile(directory, JSON.stringify(updatedProducts), (err) => {
          console.log(err);
        });
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(directory, JSON.stringify(products), (err) => {
          console.log(err);
        });
      }
    });
  }

  // Making sure we can this method on class itself
  static fetchAll(callBack) {
    getProductsFromFile(callBack);
  }

  static fetchById(id, callBack) {
    getProductsFromFile((products) => {
      const product = products.find((p) => p.id === id);
      callBack(product);
    });
  }

  static deleteProductById(id) {
    getProductsFromFile((products) => {
      const product = products.find((p) => p.id === id);
      // Keeping all products except for the one we want to delete
      const updatedproducts = products.filter((p) => p.id !== id);
      fs.writeFile(directory, JSON.stringify(updatedproducts), (err) => {
        if (!err) {
          Cart.deleteCartProduct(id, product.price);
        }
      });
    });
  }
};
