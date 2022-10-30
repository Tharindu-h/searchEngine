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
let urlCount = 0;
let crawledPages = [];

function getUrl(link, currPath){
  if(link.includes('https://man7.org/linux/man-pages/')){
    return link;
  }
  else if(link.slice(0,3) == '../'){
    return `https://man7.org/linux/man-pages/${link.replace("../", "")}`;
  }
  else{
    return null;
  }
}

const c = new Crawler({
  maxConnections : 10
});

function crawlUrl(url){
  if (seenUrls[url] || urlCount >= 1) return;
  seenUrls[url] = true;
  urlCount++;
  console.log(`Crawling: ${url}`);
  c.queue({
    uri: url,
    callback: function(err, res, done){
      if (err) console.log(err);
      else{
        let $ = res.$;
        let links = $("a");
        let title = ($("title").text()).replace(' - Linux manual page','');
        let contents = $("pre").text();
        let page = new dbModels.ManPage({
          "url": url,
          "title": title,
          "outgoingLinks": [],
          "contents": contents,
          "numOutLinks": 0
        });
        $(links).each(function(i, link){
          if($(link).attr('href')){
            let currURL = getUrl($(link).attr('href'), url);
            if (currURL != null){
              crawlUrl(currURL);
              page.outgoingLinks.push(currURL);
              page.numOutLinks++;
            }
          }
        });
        crawledPages.push(page);
      }
      done();
    }
  });
}

crawlUrl('https://man7.org/linux/man-pages/man1/bash.1.html');
c.on("drain", function(){
  saveAllPages();
});

function saveAllPages(){
  crawledPages.forEach(async (item) =>{
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