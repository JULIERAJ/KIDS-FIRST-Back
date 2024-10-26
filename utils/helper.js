const DatauriParser = require('datauri/parser');

const dateConverter = (value) => {
  const [month, day, year] = value.split('/');
  const date = new Date(`${year}-${month}-${day}`);
  return date;
};

/**
 * @description This function converts the buffer to data url
 * @param {Object} file containing the field object
 * @returns {String} The data url from the string buffer
 */
const dataUri = (file) => {
  const parser = new DatauriParser();
  return parser.format(file.mimetype.split('/')[1], file.buffer);
};

module.exports = {
  dateConverter,
  dataUri,
};
