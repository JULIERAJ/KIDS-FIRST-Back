const { StatusCodes } = require('http-status-codes');
const memberService = require('../service/member-service');
const asyncWrapper = require('../middleware/async-wrapper');

const memberRegistration = asyncWrapper(async (req, res) => {
  const {
    firstName,
    lastName,
    kidsList,
    inviteeEmail,
    inviteeInviteLater,
    family,
    principle,
  } = req.body;

  const isMemberDuplicate = await memberService.isDuplicate(
    firstName,
    lastName,
    family,
  );

  if (!isMemberDuplicate) {
    const memberData = await memberService.memberRegistration({
      family,
      firstName,
      lastName,
      principle,
      kidsList,
      inviteeEmail,
      inviteeInviteLater,
    });
    return res.status(StatusCodes.CREATED).json(memberData);
  }
  return res.status(StatusCodes.CONFLICT).json({
    message: `The member ${firstName} ${lastName} already exists in the family ${family}.`,
  });
});

module.exports = { memberRegistration };
