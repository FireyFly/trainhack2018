const fs = require('fs');

const toCamelCase = str => str.replace(/_(\w)/g, (_, ch) => ch.toUpperCase());
const uniq = arr => [...new Set(arr)];

function parseCSV(data) {
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

  const table = data.split('\n').filter(Boolean).map(parseRow);
  const keys = table.shift().map(toCamelCase);

  return table.map((row) => {
    const res = {};
    row.forEach((value, i) => {
      const key = keys[i];
      res[key] = value;
    });
    return res;
  });
}

const loadCSV = filename => parseCSV(fs.readFileSync(filename).toString());

const agencyWhitelist = new Set([
  // Train
  'SJ',
  'NSB',
  'NSB/SJ',
  'Snälltåget',
  'Blå Tåget',
  'Öresundståg',
  'MTR Express',
  'Tågab',
  'Kustpilen',
  'Krösatågen',
  'Silverlinjen',
  // Bus
//'Flixbus',
//'BT Buss',
]);

const agencies = loadCSV('sweden/agency.txt');
const routes = loadCSV('sweden/routes.txt');
const trips = loadCSV('sweden/trips.txt');
const stops = loadCSV('sweden/stops.txt');

const whitelistedAgencyIds = new Set(agencies.filter(({ agencyName }) => agencyWhitelist.has(agencyName)).map(({ agencyId }) => agencyId));

function loadFilteredStopTimes(agencyWhitelist) {
  const routeIds = new Set(routes.filter(({ agencyId }) => whitelistedAgencyIds.has(agencyId)).map(({ routeId }) => routeId));
  const tripIds = new Set(trips.filter(({ routeId }) => routeIds.has(routeId)).map(({ tripId }) => tripId));

  const data = fs.readFileSync('sweden/stop_times.txt').toString();
  const lines = data.split('\n');
  const heading = lines.shift();

  const filteredLines = lines.filter(str => tripIds.has(str.slice(0, str.indexOf(','))));
  const filteredCSV = [heading].concat(filteredLines).join('\n');

  return parseCSV(filteredCSV);
}

const stopTimes = loadFilteredStopTimes(agencyWhitelist);

console.warn('#agencies', agencies.length);
console.warn('#routes', routes.length);
console.warn('#trips', trips.length);
console.warn('#stops', stops.length);
console.warn('#stopTimes', stopTimes.length);


const stopLocationMap = {};
stops.forEach(({ stopId, stopLat, stopLon }) => {
  stopLocationMap[stopId] = [stopLat, stopLon];
});

const routeToStops = {};
const stopToRoutes = {};

/*
const freqs = {};
routes
  .filter(({ agencyId }) => whitelistedAgencyIds.has(agencyId))
  .filter(({ routeType }) => 100 <= Number(routeType) && Number(routeType) <= 199)
  .forEach((route) => {
    const key = route.routeType;
    freqs[key] = (freqs[key] || 0) + 1;
  });
console.warn(freqs);
*/

routes
  .filter(({ agencyId }) => whitelistedAgencyIds.has(agencyId))
  .filter(({ routeType }) => 100 <= Number(routeType) && Number(routeType) <= 199)
//.slice(0, 100)
  .forEach((route, i, arr) => {
    console.warn('%d/%d', i, arr.length);

    const tripIds = uniq(trips.filter(({ routeId }) => routeId === route.routeId).map(({ tripId }) => tripId));
    const repTripId = tripIds[0];

    const stopData = stopTimes
      .filter(({ tripId }) => tripId === repTripId)
      .map(({ stopId }) => ({
        stopId,
        lat: stopLocationMap[stopId][0],
        lon: stopLocationMap[stopId][1],
      }));

    routeToStops[route.routeId] = stopData;

    stopData.forEach((stop) => {
      const key = stop.stopId;
      if (stopToRoutes[key] == null) stopToRoutes[key] = [];
      stopToRoutes[key].push(route.routeId);
    });
  });

const data = {
  routeToStops,
  stopToRoutes,
};

fs.writeFileSync('output.json', JSON.stringify(data, null, 2));
console.warn('done!');
