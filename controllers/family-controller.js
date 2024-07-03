const { StatusCodes } = require('http-status-codes');

const familyService = require('../service/family-service');

const familyRegistration = async (req, res) => {
  const { familyName, userId } = req.body;

  try {
    const isFamilyDuplicate = await familyService.isDuplicate(
      familyName,
      userId,
    );

    if (!isFamilyDuplicate) {
      const familyData = await familyService.familyRegistration(
        familyName,
        userId,
      );
      return res.status(StatusCodes.CREATED).json(familyData);
    }
    return res.status(StatusCodes.CONFLICT).json({
      message: `The family with the name "${familyName}" already exists under this principle.`,
      // have to think what message to give to a user.
      // Family name already exists under this Principle?
    });
  } catch (e) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Something went wrong' });
  }
};

module.exports = { familyRegistration };
