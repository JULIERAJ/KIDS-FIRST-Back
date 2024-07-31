/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
// eslint-disable-next-line import/no-extraneous-dependencies
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
// const mongoSanitize = require('express-mongo-sanitize');

const kidsRoutes = require('./routes/kids');
const userRoutes = require('./routes/user');
const shareKid = require('./routes/share-kid');

const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');

const app = express();

app.use(helmet());
// app.use(mongoSanitize());

morgan.token(
  'body',
  (req) => `\x1b[36m"body": ${JSON.stringify(req.body)}\x1b[0m \n`,
);

// Middlewares
app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true, //allows sending cookies and credentials from client from specified origins
  }),
);
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(morgan(':body'));
app.use(cookieParser(process.env.JWT_SECRET)); //the secret key should match the one we sign the cookie with

// Routes
app.use('/api/v1', userRoutes);
app.use('/api/v1/kids', kidsRoutes);
app.use('/api/v1/kids', shareKid);

// Error handling middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
