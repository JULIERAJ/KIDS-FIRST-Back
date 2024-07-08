/* eslint-disable no-console */
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const verifyJWT = require('./middleware/verify-jwt');
const familyRoutes = require('./routes/family');
const forgetPasswordRoutes = require('./routes/forget-password');
// const invitationRoutes = require('./routes/invitation');
const loginRoutes = require('./routes/login');
const loginFacebookRoutes = require('./routes/loginFacebook');
const loginSocialRoutes = require('./routes/loginSocial');
const logoutRoutes = require('./routes/logout');
const memberRoutes = require('./routes/member');
const registerRoutes = require('./routes/register');
const resetPasswordRoutes = require('./routes/reset-password');
// eslint-disable-next-line no-unused-vars, import/order
// const { loginSocial } = require('./controllers/user-controller');
const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');

// require('dotenv').config({ path: './.env.local' });

const app = express();

morgan.token(
  'body',
  (req) => `\x1b[36m"body": ${JSON.stringify(req.body)}\x1b[0m \n`,
);

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(morgan(':body'));

app.use('/api', loginRoutes);
app.use('/api', registerRoutes);
app.use('/api', loginFacebookRoutes);
app.use('/api', loginSocialRoutes);

app.use(verifyJWT); // All routes after this will require JWT verification

app.use('/api', familyRoutes);

// app.use('/api', invitationRoutes);
app.use('/api', memberRoutes);
app.use('/api', forgetPasswordRoutes);
app.use('/api', resetPasswordRoutes);
app.use('/api', logoutRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
