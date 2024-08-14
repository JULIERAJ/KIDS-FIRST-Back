const ejs = require('ejs');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: './.env.local' });

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// function to render the email template using EJS
const renderTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, '../templates', `${templateName}.ejs`);
  return ejs.renderFile(templatePath, data);
};

// function that sends email using nodemailer
const sendEmail = async (email, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      //from: process.env.SMTP_USER,
      from: `KIDS FIRST <*********@gmail.com>`,
      to: email,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: 'kids_first_logo_beta.png',
          path: path.join(__dirname, '../media/logo/kids_first_logo_beta.png'),
          cid: 'logo',
        },
      ],
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error sending email:', error);
    // eslint-disable-next-line no-console
    console.error('Failed email details:', { email, subject, htmlContent });
    throw error; // rethrow the error to propagate it up the call stack
  }
};

// function that sends a general email
const sendGeneralEmail = async (
  email,
  subject,
  greetingText,
  messageText,
  buttonText,
  endText,
  href,
) => {
  const htmlContent = await renderTemplate('body', {
    greetingText,
    messageText,
    buttonText,
    endText,
    href,
  });
  await sendEmail(email, subject, htmlContent);
};

// function that sends an activational email
const sendActivationalEmail = async (
  email,
  subject,
  greetingText,
  messageText,
  endText,
  buttonText,
  href,
) => {
  const htmlContent = await renderTemplate('activate-email', {
    greetingText,
    messageText,
    endText,
    buttonText,
    href,
  });
  await sendEmail(email, subject, htmlContent);
};

// function to send reset password email
const resetPasswordEmail = async (
  email,
  subject,
  greetingText,
  messageText,
  endText,
  buttonText,
  href,
) => {
  const htmlContent = await renderTemplate('reset-password-email', {
    greetingText,
    messageText,
    endText,
    buttonText,
    href,
  });
  await sendEmail(email, subject, htmlContent);
};

// function that sends verification email with the link
const sendActivationEmail = async (email, emailVerificationToken) => {
  const href = `${process.env.CLIENT_URL}/activate/${email}/${emailVerificationToken}`;
  const subject = 'KIDS FIRST Account Verification';
  const greetingText = 'Hello and welcome to KIDS FIRST!';
  const messageText =
    'To continue the registration process, please click "Verify my email".';
  const endText = 'This link will expire after 60 minutes.';
  const buttonText = 'Verify my email';
  await sendActivationalEmail(
    email,
    subject,
    greetingText,
    messageText,
    endText,
    buttonText,
    href,
  );
};

// function that sends reset password email with the link
const sendResetPasswordEmail = async (email, resetPasswordToken) => {
  const href = `${process.env.CLIENT_URL}/reset-password/${email}/${resetPasswordToken}`;
  const subject = 'Reset Your Password';
  const greetingText = 'Reset your KIDS FIRST password';
  const messageText =
    'Heard you’re having trouble with your KIDS FIRST password—no need to worry! ' +
    'Click the button below to easily reset your password and get back on track.';
  const endText = 'Please note, this link will expire in 60 minutes. ' +
    'Thank you for being a part of KIDS FIRST!';
  const buttonText = 'Reset my password';
  await resetPasswordEmail(
    email,
    subject,
    greetingText,
    messageText,
    endText,
    buttonText,
    href,
  );
};

// function that sends invitation email with the link
const sendInvitationEmail = async (
  email,
  family,
  emailVerificationToken,
  firstName,
) => {
  const href = `${process.env.CLIENT_URL}/register/${email}/${family}/${emailVerificationToken}`;
  const subject = `You have been invited by ${firstName} to register in Kids First app`;
  const greetingText = '';
  const messageText = `You have been invited by ${firstName} to register in Kids First app. 
  To register on Kids First app, please click the link below:`;
  const endText = '';
  const buttonText = 'Click Here';
  await sendGeneralEmail(
    email,
    subject,
    greetingText,
    messageText,
    buttonText,
    endText,
    href,
  );
};

module.exports = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendInvitationEmail,
};
