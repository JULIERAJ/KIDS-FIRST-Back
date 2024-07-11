const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const emailService = require('../service/email-service');
const familyService = require('../service/family-service');
const userService = require('../service/user-service');
const asyncWrapper = require('../middleware/async-wrapper');
const { jwtSignAndSetCookie } = require('../utils/authUtils');
require('dotenv').config({ path: './.env.local' });
// 1 upper/lower case letter, 1 number, 1 special symbol
// eslint-disable-next-line max-len
const {
  generatePassword,
  passwordRegExp,
  emailRegExp,
} = require('../utils/passwordUtils');

// Secret key for JWT
const jwtSecret = process.env.JWT_SECRET;
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
  jwtSignAndSetCookie(
    { email: user.email, id: user._id },
    jwtSecret,
    jwtOptions,
    res,
  );

  // when the user login, then find that user's family(s), then push the info  to the front
  const userFamily = await familyService.findUserFamilyName(user._id);

  return res.status(StatusCodes.OK).json({
    email: user.email,
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
    jwtSignAndSetCookie(
      { email: data.email },
      process.env.JWT_EMAIL_VERIFICATION_SECRET,
      jwtEmailOptions,
      res,
    );

    res.json({
      email: data.email,
    });
  }
  if (user) {
    // Generate JWT and set cookie
    jwtSignAndSetCookie(
      { email: data.email },
      process.env.JWT_EMAIL_VERIFICATION_SECRET,
      jwtEmailOptions,
      res,
    );
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
      .json({ error: 'Access token is required' });
  }

  try {
    // Fetch user data from Google API
    const urlGoogleUserInfo = `https://www.googleapis.com/oauth2/v3/userinfo`;
    const response = await fetch(urlGoogleUserInfo, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Handle response from Google API
    if (!response.ok) {
      throw new Error('Failed to fetch user data from Google API');
    }

    const userData = await response.json();

    // Extract relevant user data (email, sub) from Google's response
    const { email, sub: googleUserId } = userData;

    // Attempt to find the user by Google user ID
    let user = await userService.findUser(googleUserId);

    // If user does not exist, register them (simulating registration for Google login)
    if (!user) {
      const password = generatePassword(); // Generate a secure password
      user = await userService.registration(email, password); // Register user
      userService.activateAccount(user.email); // Activate user account
    }

    // Retrieve family information associated with the user
    const userFamily = await familyService.findUserFamilyName(user._id);

    // Generate JWT and set cookie
    jwtSignAndSetCookie(
      { email, id: googleUserId },
      process.env.JWT_EMAIL_VERIFICATION_SECRET,
      jwtEmailOptions,
      res,
    );

    // Return response with user and family information
    return res.status(StatusCodes.OK).json({
      email,
      id: googleUserId,
      familyId: userFamily.id,
      familyName: userFamily.familyName,
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
  try {
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Unauthorized: No user authenticated' });
    }

    // Clear HTTP-only cookie named 'token'
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error during logout:', err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to logout' });
  }
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
  requestResetPassword,
  resetPasswordActivation,
  resetPasswordUpdates,
  resendActivationEmail,
};
