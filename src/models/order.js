const mongoose = require('mongoose');

const { Schema } = mongoose;

const OrderSchema = new Schema({
  products: [
    {
      product: { type: Schema.Types.Object, required: true, ref: 'Product' },
      quantity: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  user: {
    userId: { type: Schema.Types.Object, required: true, ref: 'User' },
  },
});

module.exports = mongoose.model('Order', OrderSchema);
