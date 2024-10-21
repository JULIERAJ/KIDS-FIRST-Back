const moment = require('moment');
const Kid = require('../models/Kid');
const User = require('../models/User');
const { dateConverter } = require('../utils/helper');

const getAllKids = async (userId) => {
  const allKids = await Kid.find({ custodyIDs: userId });
  return allKids; // Simply return the result, even if empty
};

const createKid = async (data, userId, imageProfileURL) => {
  try {
    let kid;
    const age = moment().diff(
      dateConverter(data.dateOfBirthday),
      'years',
      false,
    );

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

    await kid.save();
    await User.findByIdAndUpdate(userId, { $push: { kids: kid._id } });
    
    console.log(kid);

    return kid; // Return the created kid object
  } catch (err) {
    throw err; // Re-throw the error for consistent handling
  }
};

const getKidById = async (kidId, userId) => {
  const kid = await Kid.findOne({ _id: kidId, custodyIDs: userId });
  if (!kid) {
    throw new Error(`Kid not found`);
  }
  return kid;
};

const updateKid = async (kidId, userId, data) => {
  const updatedKid = await Kid.findOneAndUpdate(
    { _id: kidId, custodyIDs: userId },
    data,
    { new: true, runValidators: true }, // Options for findOneAndUpdate
  );
  if (!updatedKid) {
    throw new Error(`Kid not found`);
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


