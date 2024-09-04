// eslint-disable-next-line node/no-extraneous-require
const multer = require('multer');
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-extraneous-require
const DatauriParser = require('datauri/parser');
const { StatusCodes } = require('http-status-codes');

// Image is stored in memory prior to being streamed to cloudinary as there may be restrictions in temporarily storing in the server's harddisk.
const storage = multer.memoryStorage();
const uploadFilter = (req, file, callback) => {
  const typeArray = file.mimetype.split('/');
  const fileType = typeArray[1];
  try {
    if (
      fileType === 'jpg' ||
      fileType === 'png' ||
      fileType === 'jpeg' ||
      fileType === 'pdf'
    ) {
      callback(null, true);
    } else {
      // eslint-disable-next-line no-undef
      callback(
        'File type does not match: .jpg || .png || .jpeg || .pdf',
        false,
      );
    }
  } catch (err) {
    callback(new Error(err));
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
const multerUploader = (req, res, next) => {
  const uploadFiletoMulter = upload.array('file', 5);

  uploadFiletoMulter(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(StatusCodes.BAD_REQUEST).json(err);
    } else if (err) {
      res.status(StatusCodes.BAD_GATEWAY).json(err);
    } else {
      next();
    }
  });
};

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
