const { dateConverter } = require('./helper');

const validateImageURL = (url) => /\.(jpeg|jpg|png)$/.test(url);

const validateImageSize = () => {
  // eslint-disable-next-line no-unused-vars
  const MAX_SIZE = 500 * 1024; // 500 KB in bytes
  //implement logic to check file size using multer
  return true;
};

const validateDOB = (value) => {
  if (!value) return true;
  const date = dateConverter(value);
  return date < new Date();
};

module.exports = {
  validateImageURL,
  validateImageSize,
  validateDOB,
};
