const moment = require('moment');
const Kid = require('../models/Kid');
const User = require('../models/User');
const { dateConverter } = require('../utils/helper');

const getAllKids = async (userId) => {
  const allKids = await Kid.find({ custodyIDs: userId });
  return allKids;
};

const createKid = async (data, userId, imageProfileURL) => {
  let kid;
  const age = moment().diff(dateConverter(data.dateOfBirthday), 'years', false);

  // Initialize arrays if they don't exist or are empty
  if (!data.allergies || data.allergies.length === 0) data.allergies = [];
  if (!data.interests || data.interests.length === 0) data.interests = [];
  if (!data.fears || data.fears.length === 0) data.fears = [];

  if (imageProfileURL) {
    kid = new Kid({
      ...data,
      age: age,
      custodyIDs: [userId],
      imageProfileURL: imageProfileURL,
    });
  } else {
    kid = new Kid({
      ...data,
      age: age,
      custodyIDs: [userId],
    });
  }

  const result = await kid.save();
  await User.findByIdAndUpdate(userId, { $push: { kids: result._id } });
  return result;
};

const getKidById = async (kidId, userId) => {
  const kid = await Kid.findOne({ _id: kidId, custodyIDs: userId });
  if (!kid) {
    throw new Error(`Kid not found`);
  }
  return kid;
};

const updateKid = async (kidId, userId, updateData, imageProfileURL = null) => {
  // Calculate the age if the date of birth is being updated
  if (updateData.dateOfBirthday) {
    updateData.age = moment().diff(dateConverter(updateData.dateOfBirthday), 'years', false);
  }
  // Initialize arrays if they don't exist or are empty
  if (!updateData.allergies && updateData.allergies.length === 0) updateData.allergies = [];
  if (!updateData.interests && updateData.interests.length === 0) updateData.interests = [];
  if (!updateData.fears && updateData.fears.length === 0) updateData.fears = [];

  if (imageProfileURL) {
    updateData.imageProfileURL = imageProfileURL;
  }

  const updatedKid = await Kid.findByIdAndUpdate(
    { _id: kidId, custodyIDs: userId },
    updateData,
    { new: true },
  );

  if (!updatedKid) {
    throw new Error('Kid not found or failed to update');
  }

  return updatedKid;
};

const deleteKid = async (kidId, userId) => {
  const deletedKid = await Kid.findOneAndDelete({
    _id: kidId,
    custodyIDs: userId,
  });
  if (!deletedKid) {
    throw new Error(`Kid not found or you do not have custody`);
  }
  await User.findByIdAndUpdate(userId, { $pull: { kids: kidId } });
  return deletedKid;
};

module.exports = {
  getAllKids,
  createKid,
  getKidById,
  updateKid,
  deleteKid,
};
