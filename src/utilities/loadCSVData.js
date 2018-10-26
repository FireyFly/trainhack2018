const toCamelCase = str => str.replace(/_(\w)/g, (_, ch) => ch.toUpperCase());

export default function loadCSVData(csvData) {
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
