const fs = require('fs');

const toCamelCase = str => str.replace(/_(\w)/g, (_, ch) => ch.toUpperCase());
function loadCSVData(csvData) {
  const keys = csvData.fieldNames.map(toCamelCase);
  return csvData.table.map((row) => {
    const res = {};
    row.forEach((value, i) => {
      const key = keys[i];
      res[key] = value;
    });
    return res;
  });
}

function loadJSON(filename) {
  return loadCSVData(JSON.parse(fs.readFileSync(filename).toString()));
}

/*
agencyKeys [ 'agencyId', 'agencyName', 'agencyUrl', 'agencyTimezone', 'agencyLang' ]
routeKeys [ 'routeId', 'agencyId', 'routeShortName', 'routeLongName', 'routeType', 'routeUrl' ]
tripKeys [ 'routeId', 'serviceId', 'tripId', 'tripHeadsign', 'tripShortName' ]
*/

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
  'Flixbus',
  'BT Buss',
]);

const agencies = loadJSON('sweden-json/agency.json');
const routes = loadJSON('sweden-json/routes.json');
const trips = loadJSON('sweden-json/trips.json');

/*
{ Blekingetrafiken: 3523,
  SL: 116695,
  'Länstrafiken Västerbotten': 4542,
  KLT: 4113,
  'Skånetrafiken': 31765,
  SJ: 1688,
  'Länstrafiken Örebro': 4603,
  'Västtrafik': 56365,
  'Din Tur': 4613,
  Dalatrafik: 8888,
  'Sörmlandstrafiken': 5430,
  'ÖstgötaTrafiken': 9524,
  'Luleå Lokaltrafik': 1435,
  'Länstrafiken Norrbotten': 1029,
  'Länstrafiken Kronoberg': 3750,
  Bus4You: 6023,
  'Blå Tåget': 10,
  'X-trafik': 5627,
  'Länstrafiken Jämtland': 1196,
  'Värmlandstrafik': 2411,
  UL: 10564,
  Flygbussarna: 3960,
  VL: 4591,
  Hallandstrafiken: 5230,
  NSB: 21,
  'Stadsbussarna Östersund': 1117,
  'VS & Persons Bussar': 74,
  JLT: 5883,
  'Strömma': 10,
  'Nettbuss Express': 1585,
  Waxholmsbolaget: 707,
  'Cinderellabåtarna': 10,
  Skelleftebuss: 506,
  'Region Gotland': 320,
  'BT Buss': 39,
  'Härjedalingen': 64,
  Karlstadsbuss: 7130,
  'Boden Stadstrafik': 211,
  Flixbus: 384,
  'Visingsöleden': 36,
  Silverlinjen: 19,
  'Destination Gotland': 46,
  Ventrafiken: 50,
  'Öresundståg': 1152,
  'Kiruna Stadstrafik': 126,
  'Kalix stadstrafik': 45,
  'Fjällexpressen': 4,
  'Tågkompaniet Norrtåg': 277,
  'Tågkompaniet': 27,
  'Piteå Lokaltrafik': 188,
  'Gerts Busstrafik': 2,
  'Krösatågen': 200,
  'Roslagens Sjötrafik': 14,
  Bergkvarabuss: 57,
  'Haparanda lokaltrafik': 14,
  'Kosterbåtarna': 49,
  'Tågab': 48,
  'Gällivare Stadstrafik': 98,
  'Snälltåget': 20,
  'Stockholms stad': 105,
  'Tapanis Buss': 2,
  'Ressels Rederi': 38,
  Brukslinjen: 99,
  Lapplandspilen: 6,
  Skaraborgaren: 12,
  'Ekerö kommun': 238,
  Kustpilen: 154,
  'Arlanda Express': 187,
  'Trossöbuss': 30,
  Trosabussen: 50,
  'Svenska Buss': 12,
  'NSB/SJ': 7,
  'Blåklintsbuss': 63,
  Scandlines: 405,
  IKEA: 18,
  'MTR Express': 220,
  'Y-buss': 17 }
*/
/*
const tripsByAgencyFreq = {};
trips.forEach(({ routeId }) => {
  const route = routes.find(route => route.routeId === routeId);
  const agency = agencies.find(agency => agency.agencyId === route.agencyId);
  const key = agency.agencyName;
  tripsByAgencyFreq[key] = (tripsByAgencyFreq[key] || 0) + 1;
});
console.log(tripsByAgencyFreq);
*/

const agencyIds = new Set(agencies.filter(({ agencyName }) => agencyWhitelist.has(agencyName)).map(({ agencyId }) => agencyId));
const routeIds = new Set(routes.filter(({ agencyId }) => agencyIds.has(agencyId)).map(({ routeId }) => routeId));
const tripIds = new Set(trips.filter(({ routeId }) => routeIds.has(routeId)).map(({ tripId }) => tripId));

const data = fs.readFileSync('sweden/stop_times.txt').toString();
const lines = data.split('\n');
const heading = lines.shift();

const filteredLines = lines.filter(str => tripIds.has(str.slice(0, str.indexOf(','))));

const filteredCSV = [heading].concat(filteredLines).join('\n');
fs.writeFileSync('filtered.txt', filteredCSV);

// console.log(data.split('\n').slice(0, 10));
