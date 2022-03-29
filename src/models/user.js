const mongoose = require('mongoose');
const product = require('./product');

const { Schema } = mongoose;

const userSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  resetToken: {type: String},
  resetTokenExpires: {type: Date},
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
  },
  isAdmin: {type: Boolean, required: true, default: false}
});

userSchema.methods.addToCart = function (product) {
  const cartProdIndex = this.cart.items.findIndex((prod) => {
    return prod.productId.toString() === product._id.toString();
  });

  const updatedItems = [...this.cart.items];
  let quantity = 1;
  /* If item exists inside cart increase qty
    else item doesn't exist inside cart, push new item */
  if (cartProdIndex >= 0) {
    quantity = this.cart.items[cartProdIndex].quantity + 1;
    updatedItems[cartProdIndex].quantity = quantity;
  } else {
    updatedItems.push({
      productId: product._id,
      quantity: quantity,
    });
  }
  const total = (this.cart.total + product.price).toFixed(2);
  const updatedCart = {
    items: updatedItems,
    total: total,
  };

  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.deleteFromCart = function (product) {
  // Returning only non matching cart items
  let updatedPrice = 0;
  const updatedCart = this.cart.items.filter((item) => {
    if (item.productId.toString() === product._id.toString()) {
      updatedPrice = (this.cart.total - product.price * item.quantity).toFixed(
        2
      );
    }

    return item.productId.toString() !== product._id.toString();
  });
  this.cart.items = updatedCart;
  this.cart.total = updatedPrice;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [], total: 0 };
  return this.save();
};
module.exports = mongoose.model('User', userSchema);
