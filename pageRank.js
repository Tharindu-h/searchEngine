const {Matrix} = require("ml-matrix");
const mongoose = require('mongoose');
const dbPsswd = process.env.MONGODB_PSSWD;
const dbUrl = `mongodb+srv://tharindu:${dbPsswd}@cluster0.pycye8m.mongodb.net/?retryWrites=true&w=majority`
const dbModels = require('./models/schema');
const eDistance = require('euclidean-distance');

const alphaVal = 0.1;

let allFruitPages = [];
let m = [];
let randTeleportProbability = [];

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(console.log("Connected to mongodb"))
  .catch(err => console.log(err));

async function calculatePageRank(){
  let rank = dbModels.FruitPage.find({})
  .then(pages => {
    for (let i = 0; i < pages.length; i++){
      allFruitPages.push(pages[i]);
    }

    //generate the adjacency matrix
    for (let i = 0; i < allFruitPages.length; i++){
      let outgoingLinks = new Set(allFruitPages[i].links);
      let row = [];
      for (let j = 0; j < allFruitPages.length; j++){
        if (outgoingLinks.has(allFruitPages[j].url)){
          row.push(1);
        }
        else{
          row.push(0);
        }
      }
      m.push(row);
    }

    //generate the transition probability matrix
    for (let i = 0; i < m.length; i ++){
      let numOnes = 0;
      for(let j = 0; j < m[i].length; j++){
        if (m[i][j] == 1) {   numOnes++;   }
      }
      for(let j = 0; j < m[i].length; j++){
        if(numOnes == 0){
          m[i][j] = 1/(m[i].length);
          continue;
        }
        if(m[i][j] == 1) {   m[i][j] = 1/numOnes;   }
      }
    }
    //generate random probability matrix
    for (let i = 0; i < 1000; i++){
      let tempArr = [];
      for (let j = 0; j < 1000; j++){
        tempArr.push(1/1000);
      }
      randTeleportProbability.push(tempArr);
    }

    //generate the adjacency matrix mutiplied by (1 - aplha)
    let adjMatrix = new Matrix(m);
    randTeleportProbability = new Matrix(randTeleportProbability);
    adjMatrix = adjMatrix.mul(1 - alphaVal);
    randTeleportProbability = randTeleportProbability.mul(alphaVal);
    let combinedMatrix = Matrix.add(adjMatrix, randTeleportProbability);

    //find the steady-state probability vector π
    let x0 = powerIteration(combinedMatrix);
    //sort the arrays
    let pageRankVals = x0.getRow(0);
    bubbleSortDescendingOrder(pageRankVals, allFruitPages);
    return pageRankVals;
    //print out the 25 most popular pages
    // for (let i = 0; i < 25; i++){
    //   let buildString = `#${i+1}. (${pageRankVals[i]}) ${allFruitPages[i].url}`;
    //   console.log(buildString);
    // }

  })
  .catch(err => {
    console.log(err);
  });
  return rank;
}


function powerIteration(p){

  let temp = [[]];
  for(let i = 0; i < 1000; i++){
    if(i == 0) {   temp[0].push(1);   }
    else {   temp[0].push(0);   }
  }

  let x0 = new Matrix(temp);
  let prev_x0 = new Matrix(x0);
  while (true) {

    prev_x0 = x0;
    x0 = x0.mmul(p);
    let d = eDistance(prev_x0.getRow(0), x0.getRow(0));
    if(d < 0.0001){
      return x0;
    }
  }
}

function bubbleSortDescendingOrder(array, array2){
  let flag = false;
  for(let i = 0; i <= array.length-1; i++){
    flag = false;
    for(let j = 0; j < ( array.length - i -1); j++){

      // Comparing two adjacent numbers 
      // and see if first is greater than second
      if(array[j] < array[j+1]){

        // Swap them if the condition is true 
        let temp = array[j]
        array[j] = array[j + 1]
        array[j+1] = temp
        flag = true;
        let temp2 = array2[j];
        array2[j] = array2[j + 1]
        array2[j+1] = temp2;
      }
    }

    if(!flag){
      return array;
    }
  }
  return array;
}

async function getPageRank(){
  let value = await calculatePageRank();
  return value;
}

module.exports = {
  getPageRank: getPageRank
}