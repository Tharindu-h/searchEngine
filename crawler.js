const Crawler = require("crawler");
const fs = require("fs");
const mongoose = require('mongoose');
const dbPsswd = process.env.MONGODB_PSSWD;
const dbUrl = `mongodb+srv://tharindu:${dbPsswd}@cluster0.pycye8m.mongodb.net/?retryWrites=true&w=majority`;
const dbModels = require('./models/schema');

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(console.log("Connected to mongodb"))
  .catch(err => console.log(err));

let seenUrls = {};
let linkedurls = [];

function getUrl(link){
  if(link.includes('http')){
    return link;
  }
  else{
    return `https://people.scs.carleton.ca/~davidmckenney/fruitgraph/${link.replace('./', '')}`;
  }
}

const c = new Crawler({
  maxConnections : 10
});

function crawlUrl(url){
  if (seenUrls[url]) return;
  seenUrls[url] = true;
  console.log(`Crawling: ${url}`);
  c.queue({
    uri: url,
    callback: function(err, res, done){
      if (err) console.log(err);
      else{
        let $ = res.$;
        let links = $("a");
        let title = $("title").text();
        let contents = $("p").text();
        let page = new dbModels.FruitPage({
          "url": url,
          "title": title,
          "outgoingLinks": [],
          "contents": contents,
          "numOutLinks": 0
        });
        $(links).each(function(i, link){
          let currURL = getUrl($(link).attr('href'));
          crawlUrl(currURL);
          page.outgoingLinks.push(currURL);
        });
        page.numOutLinks = links.length;
        linkedurls.push(page);
      }
      done();
    }
  });
}

crawlUrl('https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html');
c.on("drain", function(){
  saveAllPages();
});

function saveAllPages(){
  linkedurls.forEach(async (item) =>{
    try{
      await item.save(function(err){
        if(err){console.log(err);}
      });
    }
    catch (e){
      console.log(e);
    }
  });
}