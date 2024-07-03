const { uid } = require('uid');
const {
  uniqueNamesGenerator,
  animals,
  colors,
} = require('unique-names-generator');

const Family = require('../models/Family');

const familyRegistration = async (familyName, userId) => {
  // if cannot find the same email in the system then create the new user

  // 1) if there is such familyname, but no that person name ,
  // check if that person is invitated, if so add
  // 2) if there is no such family name, then create a
  // new family with that principle
  const family = new Family({ familyName, user: userId });

  await family.save();

  return {
    familyName: family.familyName,
    userId,
    familyId: family._id,
  };
};

const isDuplicate = async (familyName, userId) => {
  const checkDuplicate = await Family.findOne({
    familyName,
    user: userId,
  });
  return !!checkDuplicate;
};

const findUserFamilyName = async (userId) => {
  const foundFamily = await Family.find({
    user: userId,
  });
  return foundFamily;
};

const generateFamilyName = () => {
  const firstPart = uniqueNamesGenerator({
    dictionaries: [colors, animals],
    separator: '',
    style: 'capital',
  });
  const secondPart = uid(10);

  return `${firstPart}_${secondPart}`;
};

module.exports = {
  familyRegistration,
  isDuplicate,
  generateFamilyName,
  findUserFamilyName,
};
