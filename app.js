const express = require('express')
const app = express();
const port = 3000;
const pug = require('pug');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dbPsswd = process.env.MONGODB_PSSWD;
const dbUrl = `mongodb+srv://tharindu:${dbPsswd}@cluster0.pycye8m.mongodb.net/?retryWrites=true&w=majority`;
const dbModels = require('./models/schema');
const util = require('./util');
const elasticlunr = require("elasticlunr");


//build `index` of the fruit pages
const fruitIndex = elasticlunr(function () {
  this.addField('title');
  this.addField('contents');
  this.setRef('_id');
  this.setRef('url');
});

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(console.log("Connected to mongodb"))
  .catch(err => console.log(err));

dbModels.FruitPage.find({})
.then(pages => {
  pages.forEach(p => {
    fruitIndex.addDoc(p.toObject());
  });
})
.catch(err => {
  console.log(err);
}); 

//build `index` of the man pages
const manIndex = elasticlunr(function () {
  this.addField('command');
  this.addField('contents');
  this.setRef('_id');
  this.setRef('url');
});

dbModels.ManPage.find({})
.then(pages => {
  pages.forEach(p => {
    manIndex.addDoc(p.toObject());
  });
})
.catch(err => {
  console.log(err);
}); 

// Automatically parse JSON data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Compiled pug templates
const compiledSearch = pug.compileFile('./views/search.pug');
const compiledPageDetails = pug.compileFile('./views/page_details.pug');


app.get('/', function(req, res, next){
  res.format({
    'application/json': function(){
      res.status(200).json();
      return;
    },
    'text/html': function(){
      let page = compiledSearch({});
      res.status(200).send(page);
      return;
    }
  });
});

app.get('/fruits', function(req, res){
  let s = fruitIndex.search(req.query.q, {
    fields: {
      title: {boost: 2},
      contents: {boost: 1}
    }
  });
  let results = [];

  for (let i = 0; i < s.length; i++){
    let doc = fruitIndex.documentStore.getDoc(s[i].ref);
    if (req.query.boost == "true"){
      doc.score = s[i].score * doc.pageRank;
    }
    else{
      doc.score = s[i].score;
    }
    results.push(doc);
  }
  results.sort(util.compareNumbers);
  

  res.format({
    'application/json': function(){
      results = results.slice(0, req.query.limit);
      results.push({"name":"Tharindu Hatharasinghage"});
      res.status(200).json(results);
      return;
    },
    'text/html': function(){
      results = results.slice(0, req.query.limit);
      let page = compiledSearch({results, url: "fruits/"});
      res.status(200).send(page);
      return;
    }
  });
});


app.get('/personal', function(req, res){
  let s = manIndex.search(req.query.q, {
    fields: {
      command: {boost: 2},
      contents: {boost: 1}
    }
  });
  let results = [];

  for (let i = 0; i < s.length; i++){
    let doc = manIndex.documentStore.getDoc(s[i].ref);
    if (req.query.boost == "true"){
      doc.score = s[i].score * doc.pageRank;
    }
    else{
      doc.score = s[i].score;
    }
    results.push(doc);
  }
  results.sort(util.compareNumbers);
  

  res.format({
    'application/json': function(){
      results = results.slice(0, req.query.limit);
      results.push({"name":"Tharindu Hatharasinghage"});
      res.status(200).json(results);
      return;
    },
    'text/html': function(){
      results = results.slice(0, req.query.limit);
      let page = compiledSearch({results, url: "personal/"});
      res.status(200).send(page);
      return;
    }
  });
});

app.param('fruitPageID', function(req, res, next){

  dbModels.FruitPage.findById(req.params.fruitPageID)
  .exec()
  .then(page => {
    req.post = page;
    next();
    return;
  })
  .catch(err => {
    res.status(404).send("Unknown fruit page ID");
    return;
  });
});

app.get('/fruits/:fruitPageID', function(req, res){
  let tempWords = req.post.contents.split("\n");
  let words = [];
  let seenWords = new Set();
  for (let i = 0; i < tempWords.length; i++){
    if(seenWords.has(tempWords[i])){   continue;   }
    else{   seenWords.add(tempWords[i]);   }
    let count = 1
    let m = {};
    for (let j = 0; j < tempWords.length; j++){
      if (tempWords[j] == tempWords[i] && j != i){
        count++;
      }
    }
    if (tempWords[i] == ''){   continue;   }
    m.word = tempWords[i].replace(/(\r\n|\n|\r)/gm, "");
    m.occurs = count;
    words.push(m);
  }

  res.format({
    'application/json': function(){
      let result = req.post.toJSON();
      result.words = words;
      result.name = "Tharindu Hatharasinghage";
      res.status(200).json(result);
      return;
    },
    'text/html': function(){
      req.post.words = words;
      let pageDetails = req.post;
      let page = compiledPageDetails({pageDetails});
      res.status(200).send(page);
      return;
    }
  });
});

app.param('manPageID', function(req, res, next){

  dbModels.ManPage.findById(req.params.manPageID)
  .exec()
  .then(page => {
    req.post = page;
    next();
    return;
  })
  .catch(err => {
    res.status(404).send("Unknown fruit page ID");
    return;
  });
});

app.get('/personal/:manPageID', function(req, res){
  res.format({
    'application/json': function(){
      let result = req.post.toJSON();
      result.name = "Tharindu Hatharasinghage";
      res.status(200).json(result);
      return;
    },
    'text/html': function(){
      let pageDetails = req.post;
      let page = compiledPageDetails({pageDetails});
      res.status(200).send(page);
      return;
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
});