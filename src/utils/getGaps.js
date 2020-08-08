const getGaps = (txt) => (txt.match(/(_+)/g) || []);
module.exports = getGaps;