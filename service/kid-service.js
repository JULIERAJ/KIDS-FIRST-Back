const Kid = require('../models/Kid');

const getAllKids = async (userId) => {
  const allKids = Kid.find({ custodyIDs: userId });
  if (!allKids) {
    throw new Error(`No kids found`);
  }
  return allKids;
};

const createKid = async (data, userId) => {
  const kid = new Kid({ ...data, custodyIDs: [userId] });
  await kid.save();
  return kid;
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
  return deletedKid;
};

const shareKid = async (kidId, userId, newCustodyId) => {
  const kid = await Kid.findOne({ _id: kidId, custodyID: userId });
  if (!kid) {
    throw new Error(`Kid not found or you do not have custody`);
  }
  if (kid.custodyIDs.includes(newCustodyId)) {
    throw new Error(`User already has custody of this kid`);
  }
  kid.custodyIDs.push(newCustodyId);
  await kid.save();
  return kid;
};

module.exports = {
  getAllKids,
  createKid,
  getKidById,
  updateKid,
  deleteKid,
  shareKid,
};
