const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');

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
  constructor(title, author, imgURL, description, price) {
    this.title = title;
    this.author = author;
    this.imgURL = imgURL;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      products.push(this);
      fs.writeFile(directory, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }

  // Making sure we can this method on class itself
  static fetchAll(callBack) {
    getProductsFromFile(callBack);
  }
};
