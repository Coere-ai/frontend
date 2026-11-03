/** Subdivision codes into the names people actually say.
 *
 *  The edge reports a region as a bare ISO 3166-2 subdivision code ("CA",
 *  "QC", "14"), which is unreadable in a list and ambiguous across countries:
 *  "CA" is California under US and nothing at all under CA. The platform has
 *  no table for subdivisions the way Intl.DisplayNames has one for countries,
 *  so this is the table, keyed by country first and code second.
 *
 *  Countries not listed fall back to the raw code, which is still what the
 *  edge said. That is a smaller loss than shipping half-guessed names. */

const US: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  AS: "American Samoa",
  GU: "Guam",
  MP: "Northern Mariana Islands",
  PR: "Puerto Rico",
  UM: "U.S. Minor Outlying Islands",
  VI: "U.S. Virgin Islands",
};

const CA: Record<string, string> = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NS: "Nova Scotia",
  NT: "Northwest Territories",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

const AU: Record<string, string> = {
  ACT: "Australian Capital Territory",
  NSW: "New South Wales",
  NT: "Northern Territory",
  QLD: "Queensland",
  SA: "South Australia",
  TAS: "Tasmania",
  VIC: "Victoria",
  WA: "Western Australia",
};

const GB: Record<string, string> = {
  ENG: "England",
  SCT: "Scotland",
  WLS: "Wales",
  NIR: "Northern Ireland",
};

/** Voivodeships, which the edge reports as the ISO numeric code. */
const PL: Record<string, string> = {
  "02": "Lower Silesia",
  "04": "Kuyavia-Pomerania",
  "06": "Lublin",
  "08": "Lubusz",
  "10": "Lodz",
  "12": "Lesser Poland",
  "14": "Masovia",
  "16": "Opole",
  "18": "Subcarpathia",
  "20": "Podlaskie",
  "22": "Pomerania",
  "24": "Silesia",
  "26": "Holy Cross",
  "28": "Warmia-Masuria",
  "30": "Greater Poland",
  "32": "West Pomerania",
};

/** Metropolitan and overseas regions, post-2016 names. */
const FR: Record<string, string> = {
  ARA: "Auvergne-Rhone-Alpes",
  BFC: "Bourgogne-Franche-Comte",
  BRE: "Brittany",
  CVL: "Centre-Val de Loire",
  COR: "Corsica",
  "20R": "Corsica",
  GES: "Grand Est",
  HDF: "Hauts-de-France",
  IDF: "Ile-de-France",
  NOR: "Normandy",
  NAQ: "Nouvelle-Aquitaine",
  OCC: "Occitania",
  PDL: "Pays de la Loire",
  PAC: "Provence-Alpes-Cote d'Azur",
  GP: "Guadeloupe",
  GF: "French Guiana",
  MQ: "Martinique",
  RE: "Reunion",
  YT: "Mayotte",
};

const BY_COUNTRY: Record<string, Record<string, string>> = {
  US,
  CA,
  AU,
  GB,
  PL,
  FR,
};

/** The region's name, or the code itself when we have no name for it. */
export function regionName(country: string, code: string): string {
  if (!code) return "Unknown";
  const table = BY_COUNTRY[country.toUpperCase()];
  return table?.[code.toUpperCase()] ?? table?.[code] ?? code;
}
