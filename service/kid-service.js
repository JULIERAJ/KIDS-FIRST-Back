const moment = require('moment');
const Kid = require('../models/Kid');
const User = require('../models/User');
const { dateConverter } = require('../utils/helper');

const getAllKids = async (userId) => {
  const allKids = Kid.find({ custodyIDs: userId });
  if (!allKids) {
    throw new Error(`No kids found`);
  }
  return allKids;
};

const createKid = async (data, userId, imageProfileURL) => {
  try {
    let kid;
    const age = moment().diff(
      dateConverter(data.dateOfBirthday),
      'years',
      false,
    );
    if (data.allergies.length === 0) data.allergies = [];
    if (data.interests.length === 0) data.interests = [];
    if (data.fears.length === 0) data.fears = [];
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
    return kid;
  } catch (err) {
    throw new Error(err);
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
    {
      new: true,
      runValidators: true,
    },
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
