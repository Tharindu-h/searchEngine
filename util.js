// used to sort arrays in decending order
// passed as a function to Array.prototype.sort()
function compareNumbers(a, b) {
  return b.score - a.score;
}


module.exports = {
  compareNumbers: compareNumbers
}