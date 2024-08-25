const multer = require('multer');
// eslint-disable-next-line import/no-extraneous-dependencies
const DatauriParser = require('datauri/parser');

// Image is stored in memory prior to being streamed to cloudinary as there may be restrictions in temporarily storing in the server's harddisk.
const storage = multer.memoryStorage();
const uploadFilter = (req, file, cb) => {
  const typeArray = file.mimetype.split('/');
  const fileType = typeArray[1];
  if (
    fileType === 'jpg' ||
    fileType === 'png' ||
    fileType === 'jpeg' ||
    fileType === 'pdf'
  ) {
    cb(null, true);
  } else {
    cb('File type is not accepted', false);
  }
};
const fileNameFormater = (req, file, callback) => {
  callback(null, `${file.fieldname}_${Date.now()}'`);
};

// Multer configurations
const upload = multer({
  storage: storage,
  fileFilter: uploadFilter,
  filename: fileNameFormater,
});

// Multer uploader
const multerUploader = upload.array('image', 5);

/**
 * @description This function converts the buffer to data url
 * @param {Object} file containing the field object
 * @returns {String} The data url from the string buffer
 */
const parser = new DatauriParser();
const dataUri = (file) =>
  parser.format(file.mimetype.split('/')[1], file.buffer);

module.exports = {
  multerUploader,
  dataUri,
};
