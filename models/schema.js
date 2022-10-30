const mongoose = require("mongoose");

const FruitPageSchema = new mongoose.Schema({
  url: String,
  title: String,
  outgoingLinks: [String],
  incomingLinks: [String],
  contents: String,
  numLinks: Number
});

const ManPageSchema = new mongoose.Schema({
  url: String,
  title: String,
  outgoingLinks: [String],
  incomingLinks: [String],
  contents: String,
  numOutLinks: Number,
  numInLinks: Number
});

const FruitPageModel = mongoose.model('FruitPage', FruitPageSchema);
const ManPageModel   = mongoose.model('ManPage', ManPageSchema);

module.exports = {
  FruitPage: FruitPageModel,
  ManPage: ManPageModel
}