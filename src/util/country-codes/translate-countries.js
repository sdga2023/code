import fs from 'fs';

let data;

export function countryNameToISO3166(countryName) {
  if (!data) {
    const p = new URL(`./iso3166.json`, import.meta.url).pathname;
    const rawdata = fs.readFileSync(p);
    data = JSON.parse(rawdata);
  }

  return data['3166-1'].find(
    (d) => d.name.toLowerCase() === countryName.toLowerCase() || d.official_name?.toLowerCase() === countryName.toLowerCase()
  )?.alpha_3;
}
