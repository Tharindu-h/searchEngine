const mongoose = require("mongoose");

const FruitPageSchema = new mongoose.Schema({
  url: String,
  title: String,
  links: [String],
  contents: String,
  numLinks: Number
});

const FruitPageModel = mongoose.model('FruitPage', FruitPageSchema);

module.exports = {
  FruitPage: FruitPageModel
}