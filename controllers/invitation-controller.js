const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const emailService = require('../service/email-service');
const invitationService = require('../service/invitation-service');
const asyncWrapper = require('../middleware/async-wrapper');
const userService = require('../service/user-service');

const invitation = asyncWrapper(async (req, res) => {
  const { inviter, family, inviteeEmail, firstName, inviteeInviteLater } =
    req.body;

  if (!inviteeInviteLater) {
    const duplicate = await invitationService.findInviteeDuplicate(
      inviteeEmail,
      family,
    );

    const emailVerificationToken = jwt.sign(
      { inviteeEmail },
      process.env.JWT_EMAIL_VERIFICATION_SECRET,
      { expiresIn: process.env.JWT_EMAIL_LIFETIME },
    );

    await emailService.sendInvitationEmail(
      inviteeEmail,
      family,
      emailVerificationToken,
      firstName,
    );

    if (!duplicate) {
      const invitationURL = await emailService.sendInvitationEmail(
        inviteeEmail,
        family,
        emailVerificationToken,
        firstName,
      );

      await invitationService.createInvitation(
        inviter,
        family,
        inviteeEmail,
        invitationURL,
      );

      return res.status(StatusCodes.CREATED).json({
        message: 'Invitation email is sent',
        inviteeEmail,
      });
    }
    return res.status(StatusCodes.OK).json({
      message: `Invitation email to ${inviteeEmail} is sent`,
    });
  }
  return res.status(StatusCodes.OK).json({
    message: 'Invitee has chosen to be invited later',
  });
});

const invitationAccepted = asyncWrapper(async (req, res) => {
  const emailToken = req.params.emailVerificationToken;
  const { email } = req.params;

  const invitation = await invitationService.findInviteeEmail(email);

  if (invitation.invitationAccepted === true) {
    return res.status(StatusCodes.OK).json({
      message: 'Invitation has been accepted, proceed to registration',
      email: invitation.inviteeEmail,
      invitationAccepted: invitation.invitationAccepted,
    });
  }

  const activationTokenVerified =
    await userService.emailTokenVerification(emailToken);

  if (!activationTokenVerified) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Invitation link is not correct' });
  }

  const invitationData = await invitationService.acceptedInvitation(email);

  return res.status(StatusCodes.OK).json({
    message: 'The invitation is successfully accepted',
    email: invitationData.inviteeEmail,
    invitationAccepted: invitationData.invitationAccepted,
  });
});

module.exports = { invitation, invitationAccepted };
