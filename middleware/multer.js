/* eslint-disable import/no-extraneous-dependencies */
const multer = require('multer');
const DatauriParser = require('datauri/parser');
const { StatusCodes } = require('http-status-codes');

// File size limit
const fileSize = 500000;

// Filter files that are not of correct type
const fileUploadFilter = (req, file, callback) => {
  const typeArray = file.mimetype.split('/');
  const fileType = typeArray[1];
  try {
    if (fileType === 'jpg' || fileType === 'png' || fileType === 'jpeg') {
      callback(null, true);
    } else {
      callback(new multer.MulterError('UNACCEPTED_FILE_TYPE'), false);
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
  storage: multer.memoryStorage(),
  fileFilter: fileUploadFilter,
  filename: fileNameFormater,
  limits: { fileSize: fileSize },
});

/**
 * @description Multer is used to store image in memory prior to being streamed to cloudinary as there may be restrictions in temporarily storing in the server's harddisk.
 * @param {Object} req containing files to be passed through multer
 * @returns {Object} res containing file metadata and buffer
 */
const multerUploader = (req, res, next) => {
  const uploadFiletoMulter = upload.array('file', 5);

  uploadFiletoMulter(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        err.message = `File or files are too large. File size must be limited to ${fileSize} bytes.`;
      } else if (err.code === 'UNACCEPTED_FILE_TYPE') {
        err.message = `File with unaccepted file type sent. Accepted file types are : .jpg || .png || .jpeg`;
        err.name = 'fileFilterError';
        err.field = 'file';
      }
      res.status(StatusCodes.BAD_REQUEST).json({ error: err });
    } else if (err) {
      res.status(StatusCodes.BAD_GATEWAY).json({ error: err });
    } else {
      next();
    }
  });
};

const multerKidsPhotoUploader = (req, res, next) => {
  const uploadFiletoMulter = upload.single('imageProfileURL');

  uploadFiletoMulter(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        err.message = `File or files are too large. File size must be limited to ${fileSize} bytes.`;
      } else if (err.code === 'UNACCEPTED_FILE_TYPE') {
        err.message = `File with unaccepted file type sent. Accepted file types are : .jpg || .png || .jpeg`;
        err.name = 'fileFilterError';
        err.field = 'file';
      }
      res.status(StatusCodes.BAD_REQUEST).json({ error: err });
    } else if (err) {
      res.status(StatusCodes.BAD_GATEWAY).json({ error: err });
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
  multerKidsPhotoUploader,
  dataUri,
};
