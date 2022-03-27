const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  imgURL: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Product', productSchema);
