require('dotenv').config({ path: './.env.local' });

const connectDB = require('./connect');

const { PORT } = process.env;
const app = require('../app');

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    // eslint-disable-next-line no-console
    app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

start();
