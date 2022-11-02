const e = require('express');
const mongoose = require('mongoose');
const dbPsswd = process.env.MONGODB_PSSWD;
const dbUrl = `mongodb+srv://tharindu:${dbPsswd}@cluster0.pycye8m.mongodb.net/?retryWrites=true&w=majority`;
const dbModels = require('./models/schema');

// used to sort arrays in decending order
// passed as a function to Array.prototype.sort()
function compareNumbers(a, b) {
  return b.score - a.score;
}

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(console.log("Connected to mongodb"))
  .catch(err => console.log(err));

function addIncomingLinksToManPages(){
  dbModels.ManPage.find({})
  .then(pages => {
    for (let i = 0; i < 1000; i++){
      let incomingLinks = [];
      for (let j = 0; j < 1000; j++){
        let outlinks = new Set(pages[j].outgoingLinks);
        if (outlinks.has(pages[i].url)){
          incomingLinks.push(pages[j].url);
        }

      }
      pages[i].incomingLinks = incomingLinks;
      pages[i].numInLinks = incomingLinks.length;
    }
    saveAllPages(pages);
  })
  .catch(err => {
    console.log(err);
  });
}

function addIncomingLinksToFruitPages(){
  dbModels.FruitPage.find({})
  .then(pages => {
    for (let i = 0; i < 1000; i++){
      let incomingLinks = [];
      for (let j = 0; j < 1000; j++){
        let outlinks = new Set(pages[j].outgoingLinks);
        if (outlinks.has(pages[i].url)){
          incomingLinks.push(pages[j].url);
        }

      }
      pages[i].incomingLinks = incomingLinks;
      pages[i].numInLinks = incomingLinks.length;
    }
    saveAllPages(pages);
  })
  .catch(err => {
    console.log(err);
  });
}

function updateManPages(){
  let blackList = new Set(["the", "The", "this", "This", "that", "That", "them", "Them", "then", "Then", "than", "Than", "for", "For",
    "and", "And", "not", "Not"]);
  dbModels.ManPage.find({})
  .then(pages => {
    let modifiedPages = [];
    for (let pageNum = 0; pageNum < pages.length; pageNum++){
      let content = pages[pageNum].contents.replace(/(\r\n|\n|\r|-|,)/gm, "");
      content = content.split(" ");
      let words = new Map(); 
      for(let i = 0; i < content.length; i++){
        if(content[i].length > 2 && !content[i].includes("──────") && !content[i].includes("│") && !blackList.has(content[i])){
          if (!words.get(content[i])) {
            words.set(content[i], 1);
          }
          else{
            let currCount = words.get(content[i]) + 1;
            words.set(content[i], currCount += 1);
          }
        }
      }
      for (let e of words.keys()){
        let test = e;
        let test2 = words.get(e);
        let wordObj = new dbModels.Word({
          "word" : e,
          "occurs" : test2
        });
        pages[pageNum].words.push(wordObj);
      }
      let command = pages[pageNum].title.split("(")[0];
      pages[pageNum].command = command;
      modifiedPages.push(pages[pageNum])
    }
    saveAllPages(modifiedPages);
  })
  .catch(err => {
    console.log(err);
  });
}


function saveAllPages(pages){
  pages.forEach(async (item) =>{
    try{
      await item.save(function(err){
        if(err){console.log(err);}
      });
    }
    catch (e){
      console.log(e);
    }
  });
  console.log("Done");
}
//updateManPages();

module.exports = {
  compareNumbers: compareNumbers
}