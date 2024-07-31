const { StatusCodes } = require('http-status-codes');
const asyncWrapper = require('../middleware/async-wrapper');

// Create a new share invitation
const createShareKid = asyncWrapper(async (req, res) => {
  res.status(StatusCodes.CREATED).json('Create shareKid functionality');
});

// Get all share invitations for the authenticated user
const getAllShareKids = asyncWrapper(async (req, res) => {
  res.status(StatusCodes.OK).json('Get all shareKids functionality');
});

// Get a specific share invitation by ID
const getShareKidById = asyncWrapper(async (req, res) => {
  res.status(StatusCodes.OK).json('Get shareKid by ID functionality');
});

// Update the status of a share invitation
const updateShareKid = asyncWrapper(async (req, res) => {
  res.status(StatusCodes.OK).json('Update shareKid functionality');
});

// Delete a share invitation
const deleteShareKid = asyncWrapper(async (req, res) => {
  res.status(StatusCodes.OK).json('Delete shareKid functionality');
});

module.exports = {
  createShareKid,
  getAllShareKids,
  getShareKidById,
  updateShareKid,
  deleteShareKid
};
