import iso3iso2 from '../../../data/other/iso3iso2.json';

export const ISO3ToISO2 = (iso3) => {
  return iso3iso2?.[iso3] ?? iso3;
};
