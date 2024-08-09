const ShareKid = require('../models/ShareKid');
const Kid = require('../models/Kid');
const User = require('../models/User');
const { sendInvitationEmail } = require('./email-service');

// Create a share request
const createShareRequest = async (
  inviterID,
  kidID,
  inviteeEmail,
  inviteeRole,
) => {
  const kid = await Kid.findById(kidID);
  if (!kid) throw new Error('Kid does not exist');

  const inviter = await User.findById(inviterID);
  if (!inviter || !inviter.kids.includes(kidID))
    throw new Error('Inviter does not have custody of the kid');
  if (inviter.role !== 'parent') throw new Error('Inviter is not a parent');
  if (inviter.email === inviteeEmail) {
    throw new Error(
      'You cannot create a share request to your own email address.',
    );
  }
  const invitee = await User.findOne({ email: inviteeEmail });
  if (invitee.kids.includes(kidID)) {
    throw new Error('Invitee already have custody of kid');
  }
  const existingRequest = await ShareKid.findOne({
    inviterID,
    kidID,
    inviteeEmail,
    status: 'pending',
  });
  if (existingRequest) throw new Error('Duplicate share request found');

  if (!invitee) {
    await sendInvitationEmail(inviteeEmail);
    return { message: 'Invitee is not a member, invitation email sent' };
  }

  const shareRequest = new ShareKid({
    inviterID,
    kidID,
    inviteeEmail,
    inviteeFirstName: invitee.firstName,
    inviteeLastName: invitee.lastName,
    requestType: 'share',
    status: 'pending',
  });

  try {
    const savedRequest = await shareRequest.save(); // Save the document and capture the result
    // Update invitee role in user account
    await User.findByIdAndUpdate(
      invitee._id,
      { role: inviteeRole },
      { new: true },
    );

    return {
      message: 'Share request created successfully',
      shareRequestId: savedRequest._id, // Use savedRequest._id to get the correct ID
    };
  } catch (error) {
    throw new Error('Failed to create share request');
  }
};

// Handle a share request response
const handleShareResponse = async (requestId, response, userEmail) => {
  const shareRequest = await ShareKid.findById(requestId);
  if (!shareRequest) throw new Error('Share request not found');
  if (!userEmail === shareRequest.inviteeEmail) {
    throw new Error('You do not have the right to respond to this request');
  }

  const kid = await Kid.findById(shareRequest.kidID);
  if (!kid) throw new Error('Kid not found');

  const invitee = await User.findOne({ email: shareRequest.inviteeEmail });
  if (!invitee) throw new Error('Invitee not found');

  if (response === 'accepted') {
    // Add inviteeId to kid's custodyIDs array
    if (!kid.custodyIDs.includes(invitee._id)) {
      kid.custodyIDs.push(invitee._id);
      try {
        await kid.save();
      } catch (error) {
        throw new Error('Failed to update custody information');
      }
    }

    // Add kidId to user's kids array
    if (!invitee.kids.includes(kid._id)) {
      invitee.kids.push(kid._id);
      try {
        await invitee.save();
      } catch (error) {
        throw new Error('Failed to update invitee information');
      }
    }
    // Update share request status
    shareRequest.status = 'accepted';
    try {
      await shareRequest.save();
    } catch (error) {
      throw new Error('Failed to update request status');
    }

    // Notify user
    //await notifyUser(
    //  shareRequest.inviterID,
    //  `${invitee.firstName} has accepted your request to share ${kid.firstName}'s profile`,
    //);
  } else if (response === 'declined') {
    // Update share request status
    shareRequest.status = 'declined';
    await shareRequest.save();

    // Notify user
    //await notifyUser(
    //  shareRequest.inviterID,
    //  `${invitee.firstName} has declined your request to share ${kid.firstName}'s profile`,
    //);
  }

  return { message: `Share request ${response}` };
};

// Create a delete request
const createDeleteRequest = async (inviterID, kidID) => {
  const kid = await Kid.findById(kidID);
  if (!kid) throw new Error('Kid does not exist');

  const inviter = await User.findById(inviterID);
  if (!inviter || !inviter.kids.includes(kidID))
    throw new Error('Inviter does not have custody of the kid');
  if (inviter.role !== 'parent') throw new Error('Inviter is not a parent');

  const coParent = await User.findOne({
    kids: { $in: [kidID] },
    role: 'parent',
    _id: { $ne: inviterID },
  });

  if (!coParent) {
    // Delete Kid profile
    await Kid.findByIdAndDelete(kidID);

    // Remove kidId from user kids array
    inviter.kids = inviter.kids.filter((KidId) => KidId.toString() !== kidID);
    try {
      await inviter.save();
    } catch (error) {
      throw new Error('Failed to remove kidId from user kids array');
    }

    return { message: 'Kid profile deleted successfully' };
  }

  const existingRequest = await ShareKid.findOne({
    kidID,
    requestType: 'delete',
    status: 'pending',
  });
  if (existingRequest) throw new Error('Duplicate delete request found');

  const deleteRequest = new ShareKid({
    inviterID,
    kidID,
    inviteeEmail: coParent.email,
    inviteeFirstName: coParent.firstName,
    inviteeLastName: coParent.lastName,
    requestType: 'delete',
    status: 'pending',
  });

  try {
    const savedRequest = await deleteRequest.save(); // Save the document and capture the result

    // await notifyUser(
    //  coParent._id,
    //  `${inviter.firstName} has requested to delete ${kid.firstName}'s profile`,
    //);

    return {
      message: 'Delete request created successfully',
      deleteRequestId: savedRequest._id, // Use savedRequest._id to get the correct ID
    };
  } catch (error) {
    throw new Error('Failed to create delete request');
  }
};

// Handle a delete request response
const handleDeleteResponse = async (requestId, response, userEmail) => {
  // eslint-disable-next-line no-console
  console.log('useremail: ', userEmail);
  const deleteRequest = await ShareKid.findById(requestId);
  if (!deleteRequest) throw new Error('Delete request not found');
  if (userEmail !== deleteRequest.inviteeEmail) {
    throw new Error('You do not have the right to respond to this request');
  }

  //const kid = await Kid.findById(deleteRequest.kidID);

  if (response === 'accepted') {
    // Delete Kid profile
    await Kid.findByIdAndDelete(deleteRequest.kidID);

    // Delete kid id from all users who has deleted kid id
    await User.updateMany(
      { kids: deleteRequest.kidID },
      { $pull: { kids: deleteRequest.kidID } },
    );

    // Update delete request status
    deleteRequest.status = 'accepted';
    try {
      await deleteRequest.save();
    } catch (error) {
      throw new Error('Failed to update delete request status');
    }

    // Notify user
    // await notifyUser(
    //   deleteRequest.inviterID,
    //   `Your delete request was accepted and the ${kid.firstName} profile was deleted`,
    // );
  } else if (response === 'declined') {
    // Update delete request status
    deleteRequest.status = 'declined';
    try {
      await deleteRequest.save();
    } catch (error) {
      throw new Error('Failed to update delete request status');
    }

    // Notify user
    // await notifyUser(
    //   deleteRequest.inviterID,
    //   `Your request to delete ${kid.firstName}'s profile was not declined.`,
    // );
  }

  return { message: `Delete request ${response}` };
};

// Get all pending requests for a user
const getUserRequests = async (userEmail) =>
  ShareKid.find({
    inviteeEmail: userEmail,
    status: 'pending',
  });

module.exports = {
  createShareRequest,
  handleShareResponse,
  createDeleteRequest,
  handleDeleteResponse,
  getUserRequests,
};
