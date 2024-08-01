const Kid = require('../models/Kid');

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
  shareKid,
};
