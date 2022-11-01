// used to sort arrays in decending order
// passed as a function to Array.prototype.sort()
const mongoose = require('mongoose');
const dbPsswd = process.env.MONGODB_PSSWD;
const dbUrl = `mongodb+srv://tharindu:${dbPsswd}@cluster0.pycye8m.mongodb.net/?retryWrites=true&w=majority`;
const dbModels = require('./models/schema');

function compareNumbers(a, b) {
  return b.score - a.score;
}

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(console.log("Connected to mongodb"))
  .catch(err => console.log(err));

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
}


module.exports = {
  compareNumbers: compareNumbers
}