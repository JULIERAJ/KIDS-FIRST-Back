/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
const { config, uploader } = require('cloudinary').v2;
// eslint-disable-next-line import/no-extraneous-dependencies
const { resources_by_asset_folder } = require('cloudinary').v2.api;

const dotenv = require('dotenv');

dotenv.config();

const cloudinaryConfig = (req, res, next) => {
  config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  next();
};

module.exports = { cloudinaryConfig, uploader, resources_by_asset_folder };
