const mongoose = require("mongoose");

const FruitPageSchema = new mongoose.Schema({
  url: String,
  title: String,
  outgoingLinks: [String],
  incomingLinks: [String],
  contents: String,
  numOutLinks: Number,
  numInLinks: Number,
  pageRank: Number
});

const WordSchema = new mongoose.Schema({
  word: String,
  occurs: Number
});

const ManPageSchema = new mongoose.Schema({
  url: String,
  title: String,
  command: String,
  outgoingLinks: [String],
  incomingLinks: [String],
  contents: String,
  words: [WordSchema],
  numOutLinks: Number,
  numInLinks: Number,
  pageRank: Number
});

const FruitPageModel = mongoose.model('FruitPage', FruitPageSchema);
const WordModel      = mongoose.model('Word', WordSchema);
const ManPageModel   = mongoose.model('ManPage', ManPageSchema);

module.exports = {
  FruitPage: FruitPageModel,
  Word: WordModel,
  ManPage: ManPageModel
}