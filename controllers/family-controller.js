const { StatusCodes } = require('http-status-codes');
const familyService = require('../service/family-service');
const asyncWrapper = require('../middleware/async-wrapper');

const familyRegistration = asyncWrapper(async (req, res) => {
  const { familyName, userId } = req.body;

  const isFamilyDuplicate = await familyService.isDuplicate(familyName, userId);

  if (!isFamilyDuplicate) {
    const familyData = await familyService.familyRegistration(
      familyName,
      userId,
    );
    return res.status(StatusCodes.CREATED).json(familyData);
  }
  return res.status(StatusCodes.CONFLICT).json({
    message: `The family with the name "${familyName}" already exists under this user.`,
    // have to think what message to give to a user.
    // Family name already exists under this User?
  });
});

module.exports = { familyRegistration };
