const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
const connectDB = (url) => {
  try {
    mongoose.connect(url);
    // eslint-disable-next-line no-console
    console.log('Database connected successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Database connected failed');
    throw error;
  }
};
module.exports = connectDB;
