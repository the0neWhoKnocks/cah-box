const shuffleArray = (arr) => {
  const _arr = [...arr];
  
  for (let i = _arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = _arr[i];
    _arr[i] = _arr[j];
    _arr[j] = temp;
  }

  return _arr;
};

module.exports = shuffleArray;
