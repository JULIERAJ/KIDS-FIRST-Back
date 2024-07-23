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
const authenticateUser = require('./middleware/authentication');
const forgetPasswordRoutes = require('./routes/forget-password');
const loginRoutes = require('./routes/login');
const loginFacebookRoutes = require('./routes/loginFacebook');
const loginSocialRoutes = require('./routes/loginSocial');
const logoutRoutes = require('./routes/logout');
const registerRoutes = require('./routes/register');
const resetPasswordRoutes = require('./routes/reset-password');
const kidsRoutes = require('./routes/kids');
// eslint-disable-next-line no-unused-vars, import/order
// const { loginSocial } = require('./controllers/user-controller');
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

// Public routes
app.use('/api', loginRoutes);
app.use('/api', registerRoutes);
app.use('/api', loginFacebookRoutes);
app.use('/api', loginSocialRoutes);
app.use('/api', forgetPasswordRoutes);
app.use('/api', resetPasswordRoutes);

// Protected routes
app.use('/api/kids', authenticateUser, kidsRoutes);
app.use('/api', authenticateUser, logoutRoutes);

// Error handling middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
