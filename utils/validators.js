const { dateConverter } = require('./helper');

const validateImageURL = (url) => /(jpeg|jpg|png)$/.test(url);

const validateImageSize = (value) => value < process.env.MAX_FILE_SIZE;

const validateStorageSize = (value) => value < process.env.MAX_STORAGE_SIZE;

const validateDOB = (value) => {
  if (!value) return true;
  const date = dateConverter(value);
  return date < new Date();
};

module.exports = {
  validateImageURL,
  validateImageSize,
  validateStorageSize,
  validateDOB,
};
