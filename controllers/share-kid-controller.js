const { StatusCodes } = require('http-status-codes');
const asyncWrapper = require('../middleware/async-wrapper');
const shareKidService = require('../service/share-kid-service');

// Create a new share request
const createShareRequest = asyncWrapper(async (req, res) => {
  const { kidId } = req.params;
  const { inviteeEmail, inviteeRole } = req.body;
  const inviterID = req.user._id;
  const result = await shareKidService.createShareRequest(
    inviterID,
    kidId,
    inviteeEmail,
    inviteeRole,
  );
  res.status(StatusCodes.CREATED).json(result);
});

// Get all pending requests for the authenticated user
const getAllPendingRequests = asyncWrapper(async (req, res) => {
  const userEmail = req.user.email; // Assuming you have user information in req.user from authentication
  const requests = await shareKidService.getUserRequests(userEmail);
  res.status(StatusCodes.OK).json(requests);
});
// Create a new delete request
const createDeleteRequest = asyncWrapper(async (req, res) => {
  const { kidId } = req.params;
  const inviterID = req.user._id;
  const result = await shareKidService.createDeleteRequest(inviterID, kidId);
  res.status(StatusCodes.OK).json(result);
});

// Handle a share request response
const handleShareResponse = asyncWrapper(async (req, res) => {
  const { requestId } = req.params;
  const { response } = req.body;
  const userEmail = req.user.email;
  const result = await shareKidService.handleShareResponse(
    requestId,
    response,
    userEmail,
  );
  res.status(StatusCodes.OK).json(result);
});

// Handle a delete request response
const handleDeleteResponse = asyncWrapper(async (req, res) => {
  const { requestId } = req.params;
  const { response } = req.body;
  const userEmail = req.user.email;
  const result = await shareKidService.handleDeleteResponse(
    requestId,
    response,
    userEmail,
  );
  res.status(StatusCodes.OK).json(result);
});

module.exports = {
  createShareRequest,
  createDeleteRequest,
  handleShareResponse,
  handleDeleteResponse,
  getAllPendingRequests,
};
