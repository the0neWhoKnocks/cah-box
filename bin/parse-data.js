#!/usr/bin/env node

// NOTE: Usage
// 1. Scrape new data from https://www.cardsagainsthumanity.com/.
//    `copy(JSON.stringify(window.blackCardList, null, 2))`
//    `copy(JSON.stringify(window.whiteCardList, null, 2))`
// 2. In the `black` and `white` nodes, add a temporary entry for `"---",`, and
//    then paste in the newly scraped JSON data.
// 3. Run this script (`node ./bin/parse-data.js`). A new file will be created
//    along side `data.json`. Move the parsed and de-duplicated items to 
//    `data.json` (removing the temporary entry, and newly scraped items). 

const { readFile, writeFile } = require('node:fs/promises');
const { dirname, resolve } = require('node:path');

(async () => {
  const BLANK_LINE = '__________';
  const DATA_FILE_PATH = resolve('./src/data.json');
  const data = JSON.parse(await readFile(DATA_FILE_PATH));
  const payload = {};
  
  const parse = (txt) => {
    return txt
      .replace(/<br><br>/g, ' ')
      .replace(/<br>/g, '')
      .replace(/<i>([^<]+)<\/i>/g, '$1')
      .replace(/"/g, '&quot;')
      .replace(/[_]+/g, BLANK_LINE);
  };
  
  ['black', 'white'].forEach((key) => {
    const old = [];
    
    payload[key] = data[key].reduce((arr, txt) => {
      if (old[old.length - 1] === '---') {
        const parsed = parse(txt);
        if (!old.includes(parsed)) arr.push(parsed);
      }
      else old.push(txt);
      
      return arr;
    }, []);
  });
  
  await writeFile(`${dirname(DATA_FILE_PATH)}/data.tmp.json`, JSON.stringify(payload, null, 2));
  
  console.log(`\nUnique items\n------------\n  black: ${payload.black.length}\n  white: ${payload.white.length}`);
})();
