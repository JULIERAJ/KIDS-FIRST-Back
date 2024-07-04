const validateImageURL = (url) => {
  return /\.(jpeg|jpg|png)$/.test(url);
};

const validateImageSize = (url) => {
  const MAX_SIZE = 500 * 1024; // 500 KB in bytes
  // Implement actual logic to check file size if possible
  return true; 
};

const validateDOB = (value) => {
  if (!value) return true;
  const [day, month, year] = value.split('/');
  const date = new Date(`${year}-${month}-${day}`);
  return date < new Date();
};

module.exports = {
  validateImageURL,
  validateImageSize,
  validateDOB,
};
