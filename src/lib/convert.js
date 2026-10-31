// Unit conversion engine — all local, no API needed.
// Each category: units defined with factor relative to a base unit.
// Temperature handled separately (non-linear).

export const CATEGORIES = {
  length: {
    label: 'Length',
    base: 'Meter',
    units: {
      'Millimeter': 0.001,
      'Centimeter': 0.01,
      'Meter': 1,
      'Kilometer': 1000,
      'Inch': 0.0254,
      'Foot': 0.3048,
      'Yard': 0.9144,
      'Mile': 1609.344,
    },
  },
  weight: {
    label: 'Weight',
    base: 'Kilogram',
    units: {
      'Milligram': 0.000001,
      'Gram': 0.001,
      'Kilogram': 1,
      'Tonne': 1000,
      'Ounce': 0.028349523125,
      'Pound': 0.45359237,
      'Stone': 6.35029318,
    },
  },
  temperature: {
    label: 'Temperature',
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
  },
  volume: {
    label: 'Volume',
    base: 'Liter',
    units: {
      'Milliliter': 0.001,
      'Liter': 1,
      'Cubic Meter': 1000,
      'Teaspoon (US)': 0.00492892159375,
      'Tablespoon (US)': 0.01478676478125,
      'Fluid Ounce (US)': 0.0295735295625,
      'Cup (US)': 0.2365882365,
      'Pint (US)': 0.473176473,
      'Quart (US)': 0.946352946,
      'Gallon (US)': 3.785411784,
    },
  },
  speed: {
    label: 'Speed',
    base: 'Meters/sec',
    units: {
      'Meters/sec': 1,
      'Kilometers/hr': 1 / 3.6,
      'Miles/hr': 0.44704,
      'Feet/sec': 0.3048,
      'Knots': 0.5144444444,
    },
  },
  time: {
    label: 'Time',
    base: 'Second',
    units: {
      'Millisecond': 0.001,
      'Second': 1,
      'Minute': 60,
      'Hour': 3600,
      'Day': 86400,
      'Week': 604800,
      'Month (avg)': 2629800,
      'Year (avg)': 31557600,
    },
  },
  data: {
    label: 'Data',
    base: 'Byte',
    units: {
      'Bit': 0.125,
      'Byte': 1,
      'Kilobyte': 1024,
      'Megabyte': 1048576,
      'Gigabyte': 1073741824,
      'Terabyte': 1099511627776,
      'Petabyte': 1125899906842624,
    },
  },
};

export const CATEGORY_IDS = Object.keys(CATEGORIES);

export function getUnitNames(categoryId) {
  const cat = CATEGORIES[categoryId];
  if (!cat) return [];
  return Array.isArray(cat.units) ? cat.units : Object.keys(cat.units);
}

function convertTemperature(value, from, to) {
  let celsius;
  if (from === 'Celsius') celsius = value;
  else if (from === 'Fahrenheit') celsius = (value - 32) * 5 / 9;
  else celsius = value - 273.15; // Kelvin

  if (to === 'Celsius') return celsius;
  if (to === 'Fahrenheit') return celsius * 9 / 5 + 32;
  return celsius + 273.15; // Kelvin
}

export function convert(categoryId, value, from, to) {
  if (from === to) return value;
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  if (categoryId === 'temperature') {
    return convertTemperature(num, from, to);
  }
  const cat = CATEGORIES[categoryId];
  const fromFactor = cat.units[from];
  const toFactor = cat.units[to];
  if (fromFactor == null || toFactor == null) return null;
  return (num * fromFactor) / toFactor;
}

export function formatResult(value) {
  if (value === null) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e15 || (abs < 1e-6 && abs !== 0)) {
    return value.toExponential(6);
  }
  // Trim to sensible precision
  const rounded = parseFloat(value.toPrecision(8));
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 8 });
}

// Quick picks shown per category
export const QUICK_PICKS = {
  length: [
    { value: 1, from: 'Mile', to: 'Kilometer' },
    { value: 1, from: 'Foot', to: 'Centimeter' },
    { value: 100, from: 'Meter', to: 'Yard' },
    { value: 5, from: 'Kilometer', to: 'Mile' },
  ],
  weight: [
    { value: 1, from: 'Pound', to: 'Kilogram' },
    { value: 1, from: 'Kilogram', to: 'Pound' },
    { value: 16, from: 'Ounce', to: 'Gram' },
    { value: 1, from: 'Stone', to: 'Kilogram' },
  ],
  temperature: [
    { value: 32, from: 'Fahrenheit', to: 'Celsius' },
    { value: 100, from: 'Celsius', to: 'Fahrenheit' },
    { value: 0, from: 'Celsius', to: 'Kelvin' },
    { value: 72, from: 'Fahrenheit', to: 'Celsius' },
  ],
  volume: [
    { value: 1, from: 'Gallon (US)', to: 'Liter' },
    { value: 1, from: 'Liter', to: 'Fluid Ounce (US)' },
    { value: 2, from: 'Cup (US)', to: 'Milliliter' },
    { value: 1, from: 'Quart (US)', to: 'Liter' },
  ],
  speed: [
    { value: 60, from: 'Miles/hr', to: 'Kilometers/hr' },
    { value: 100, from: 'Kilometers/hr', to: 'Miles/hr' },
    { value: 10, from: 'Meters/sec', to: 'Kilometers/hr' },
    { value: 30, from: 'Knots', to: 'Kilometers/hr' },
  ],
  time: [
    { value: 1, from: 'Hour', to: 'Minute' },
    { value: 7, from: 'Day', to: 'Hour' },
    { value: 1, from: 'Year (avg)', to: 'Day' },
    { value: 90, from: 'Minute', to: 'Hour' },
  ],
  data: [
    { value: 1, from: 'Gigabyte', to: 'Megabyte' },
    { value: 1024, from: 'Megabyte', to: 'Gigabyte' },
    { value: 1, from: 'Terabyte', to: 'Gigabyte' },
    { value: 8, from: 'Bit', to: 'Byte' },
  ],
};
