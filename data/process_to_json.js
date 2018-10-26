const fs = require('fs');

function readCSV(filename) {
  function parseRow(str) {
    const res = [];
    let state = 'data', start = 0, i;

    const accept = () => {
      res.push(str.slice(start, i));
      start = i + 1;
    };

    for (i = 0; i < str.length; i++) {
      if (str[i] === ',' && state === 'data') {
        accept();
      } else if (str[i] === '"' && state === 'data') {
        state = 'quoted';
        start = i + 1;
      } else if (str[i] === '"' && state === 'quoted') {
        accept();
        state = 'data';
      }
    }
    accept();

    return res;
  }

  const data = fs.readFileSync(filename).toString();
  const table = data.split('\n').filter(Boolean).map(parseRow);
  const fieldNames = table.shift();

  return {
    fieldNames,
    table,
  };
}

[
  'agency',
  'calendar',
  'calendar_dates',
  'feed_info',
  'routes',
//'stop_times',
  'stops',
  'transfers',
  'trips',
].forEach((file) => {
  const obj = readCSV(`sweden/${file}.txt`);
  fs.writeFileSync(`sweden-json/${file}.json`, JSON.stringify(obj));
});

const obj = readCSV('filtered.txt');
fs.writeFileSync('sweden-json/stop_times.json', JSON.stringify(obj));

/*
const data = fs.readFileSync('sweden/stop_times.txt').toString()
console.log(data.split('\n').slice(0, 10));
*/
