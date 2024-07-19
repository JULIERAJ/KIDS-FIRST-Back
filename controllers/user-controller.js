const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const emailService = require('../service/email-service');
const familyService = require('../service/family-service');
const userService = require('../service/user-service');
const asyncWrapper = require('../middleware/async-wrapper');
const attachCookies = require('../utils/authUtils');
require('dotenv').config({ path: './.env.local' });
// 1 upper/lower case letter, 1 number, 1 special symbol
// eslint-disable-next-line max-len
const {
  passwordRegExp,
  emailRegExp,
} = require('../utils/passwordUtils');

const jwtOptions = { expiresIn: process.env.JWT_LIFETIME };
const jwtEmailOptions = { expiresIn: process.env.JWT_EMAIL_LIFETIME };

const registration = asyncWrapper(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // check that first name is entered
  if (!firstName) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'First name is required' });
  }
  let user = await userService.findUser(email);

  if (user) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ message: 'This email address is already in use' });
  }

  if (!passwordRegExp.test(password)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: `Password must be at least 8 characters 
          long and contain at least one uppercase letter, one lowercase letter, 
          one number, and one symbol.`,
    });
  }
  if (!emailRegExp.test(email)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Invalid email' });
  }

  user = await userService.registration(firstName, lastName, email, password);

  const emailVerificationToken = await jwt.sign(
    { email },
    process.env.JWT_EMAIL_VERIFICATION_SECRET,
    jwtEmailOptions,
  );

  await emailService.sendActivationEmail(email, emailVerificationToken);

  return res.status(StatusCodes.CREATED).json({
    message: 'Verify your email.',
    email: user.email,
    emailIsActivated: user.emailIsActivated,
  });
});
const accountActivation = asyncWrapper(async (req, res) => {
  const activationToken = req.params.emailVerificationToken;
  const { email } = req.params;
  const user = await userService.findUser(email);
  if (user.emailIsActivated === true) {
    return res.status(StatusCodes.OK).json({
      message: 'Email has been verified',
      email: user.email,
      emailIsActivated: user.emailIsActivated,
    });
  }
  const activationTokenVerified =
    await userService.emailTokenVerification(activationToken);
  if (!activationTokenVerified) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Activation link is not correct' });
  }
  const userData = await userService.activateAccount(email);
  // autogenerate family name and save it in db
  const familyName = familyService.generateFamilyName();
  const familyNameRegistration = await familyService.familyRegistration(
    familyName,
    userData._id,
  );
  return res.status(StatusCodes.OK).json({
    message: 'The account is successfully activated',
    email: userData.email,
    emailIsActivated: userData.emailIsActivated,
    familyName: familyNameRegistration.familyName,
  });
});

const resendActivationEmail = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  const user = await userService.findUser(email);
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'User not found' });
  }
  const emailVerificationToken = await jwt.sign(
    { email },
    process.env.JWT_EMAIL_VERIFICATION_SECRET,
    jwtEmailOptions,
  );
  await emailService.sendActivationEmail(email, emailVerificationToken);
  return res
    .status(StatusCodes.OK)
    .json({ message: 'Activation email resent successfully' });
});

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  const isEmailCorrect = email && emailRegExp.test(email);
  if (!isEmailCorrect) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Invalid email address' });
  }
  const user = await userService.findUser(email);
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
  }
  const isPasswordCorrect =
    password && (await userService.isPasswordCorrect(email, password));
  if (!isPasswordCorrect) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: 'Password is not correct' });
  }

  // Generate JWT and set cookie
  attachCookies({ res, user });

  // when the user login, then find that user's family(s), then push the info  to the front
  const userFamily = await familyService.findUserFamilyName(user._id);

  return res.status(StatusCodes.OK).json({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    id: user._id,
    familyId: userFamily[0].id,
    familyName: userFamily[0].familyName,
  });
});

const loginFacebook = asyncWrapper(async (req, res) => {
  const { accessToken, userID } = req.body;
  const urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
  const fetchResponse = await fetch(urlGraphFacebook, { method: 'GET' });
  const data = await fetchResponse.json();
  const { email } = data;
  const user = await userService.findUser(email);
  if (!user) {
    const password = data.email + process.env.JWT_EMAIL_VERIFICATION_SECRET;
    const emailIsActivated = true;
    await userService.registration(data.email, password, emailIsActivated);

    // Generate JWT and set cookie
    //TODO: to be updated later
    /*attachCookies(
      { email: data.email },
      process.env.JWT_EMAIL_VERIFICATION_SECRET,
      jwtEmailOptions,
      res,
    );*/

    res.json({
      email: data.email,
    });
  }
  if (user) {
    // Generate JWT and set cookie
    //TODO: to be updated later
    /*attachCookies(
      { email: data.email },
      process.env.JWT_EMAIL_VERIFICATION_SECRET,
      jwtEmailOptions,
      res,
    );*/
    res.json({
      email: data.email,
    });
  }
});

const loginSocial = asyncWrapper(async (req, res) => {
  const { accessToken } = req.body;

  // Handle missing access token
  if (!accessToken) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: 'Access token and email is required' });
  }

  try {
    // Fetch user data from Google API
    const urlGoogleUserInfo = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`;

    const response = await fetch(urlGoogleUserInfo);
    // Handle response from Google API
    if (!response.ok) {
      throw new Error('Failed to fetch user data from Google API');
    }

    const userData = await response.json();
    // Extract relevant user data (email, sub) from Google's response
    const {
      email,
      sub: googleUserId,
      given_name: firstName,
      family_name: lastName,
    } = userData;

    if (!email || !firstName || !lastName) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Invalid user data from Google' });
    }
    // Attempt to find the user by Google user ID
    let user = await userService.findUser(googleUserId);

    if (!user) {
      user = await userService.findUser(email);

      if (user) {
        user.googleUserId = googleUserId;
        await user.save();
      } else {
        user = await userService.registration(
          firstName,
          lastName,
          email,
          googleUserId,
        );
        userService.activateAccount(user.email);
      }
    }
    if (!user || !user._id) {
      throw new Error('User creation failed');
    }

    // Generate JWT and set cookie
    //TODO: to be updated later
    /*attachCookies(
      { email, id: googleUserId },
      process.env.JWT_EMAIL_VERIFICATION_SECRET,
      jwtEmailOptions,
      res,
    );*/
    attachCookies({ res, user });

    return res.status(StatusCodes.OK).json({
      email: user.email,
      googleUserId: user.googleUserId,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching user data from Google API:', error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to login with Google' });
  }
});

const logout = asyncWrapper(async (req, res) => {
  // Clear HTTP-only cookie named 'token'
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    signed: true,
    expires: new Date(0),
  });

  res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
});

const checkAuth = asyncWrapper(async (req, res) => {
  res
    .status(StatusCodes.OK)
    .json({ message: 'User is authenticated', user: req.user });
});

const requestResetPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Email is required' });
  }
  const user = await userService.findUser(email);
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ error: 'No user found with this email address' });
  }
  const passwordResetVerificationToken = await jwt.sign(
    { email },
    process.env.JWT_EMAIL_VERIFICATION_SECRET,
    jwtOptions,
  );
  await emailService.sendResetPasswordEmail(
    email,
    passwordResetVerificationToken,
  );
  return res.status(StatusCodes.OK).json({
    message: `Reset password link sent to ${email}`,
  });
});

const resetPasswordActivation = asyncWrapper(async (req, res) => {
  const { email, resetPasswordToken } = req.params;
  if (userService.validateUserAndToken(email, resetPasswordToken)) {
    return res
      .status(StatusCodes.CREATED)
      .json({ status: StatusCodes.CREATED });
  }
  return res.status(StatusCodes.UNAUTHORIZED).json({
    status: StatusCodes.UNAUTHORIZED,
    message: 'User does not exist',
  });
});

const resetPasswordUpdates = asyncWrapper(async (req, res) => {
  const { email, resetPasswordToken } = req.params;
  const { password } = req.body;
  if (!passwordRegExp.test(password)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: `Password must be at least 10 characters long and contain 
        at least one uppercase letter, one lowercase letter, one number, and one symbol`,
    });
  }
  const decoded = await userService.emailTokenVerification(resetPasswordToken);
  if (!decoded) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid token' });
  }
  const user = await userService.updateUserPassword(email, password);
  await user.save();
  return res
    .status(StatusCodes.OK)
    .json({ msg: 'Password updated successfully' });
});

module.exports = {
  registration,
  accountActivation,
  login,
  loginFacebook,
  loginSocial,
  logout,
  checkAuth,
  requestResetPassword,
  resetPasswordActivation,
  resetPasswordUpdates,
  resendActivationEmail,
};
