const Kid = require('../models/Kid');
const User = require('../models/User');
const moment = require('moment');
const { getAllKids, createKid, getKidById, updateKid, deleteKid } = require('./kid-service');

jest.mock('../models/Kid');
jest.mock('../models/User');
jest.mock('moment');

describe('Kids Service', () => {
  describe('getAllKids', () => {
    it('should return all kids for a user', async () => {
      const mockKids = [{ name: 'John' }, { name: 'Jane' }];
      Kid.find.mockResolvedValue(mockKids);

      const result = await getAllKids('userId');
      expect(result).toEqual(mockKids);
      expect(Kid.find).toHaveBeenCalledWith({ custodyIDs: 'userId' });
    });

    it('should NOT throw an error if no kids are found', async () => { // Adjusted test
      Kid.find.mockResolvedValue([]); 

      const result = await getAllKids('userId'); 
      expect(result).toEqual([]); 
    });
  });

  describe('createKid', () => {
    it('should create a new kid and return it', async () => {
      const mockKidData = { 
        name: 'John', 
        dateOfBirthday: '01/01/2015', 
        allergies: [], 
        interests: [], 
        fears: [] 
      };

      const mockAge = 9; 
      moment.mockImplementation(() => ({
        diff: jest.fn().mockReturnValue(mockAge), 
      }));

      const savedKid = { ...mockKidData, age: mockAge, custodyIDs: ['userId'], _id: 'mockKidId' }; 
      Kid.prototype.save = jest.fn().mockResolvedValue(savedKid);
      User.findByIdAndUpdate.mockResolvedValue({ _id: 'userId' }); 

      const result = await createKid(mockKidData, 'userId');

      expect(result).toEqual(savedKid);
      expect(Kid.prototype.save).toHaveBeenCalled();
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('userId', { $push: { kids: savedKid._id } }); 
    });

    it('should throw an error if kid creation fails', async () => {
      const mockKidData = { 
        name: 'John', 
        dateOfBirthday: '01/01/2015', 
        allergies: [], 
        interests: [], 
        fears: [] 
      };
      const errorMessage = 'Error creating kid';
      Kid.prototype.save = jest.fn().mockRejectedValue(new Error(errorMessage));

      await expect(createKid(mockKidData, 'userId'))
        .rejects
        .toThrow(new Error(errorMessage)); // Expecting a wrapped error
    });
  });

  describe('getKidById', () => {
    it('should return a kid by ID', async () => {
      const mockKid = { _id: 'kidId', name: 'John', custodyIDs: ['userId'] };
      Kid.findOne.mockResolvedValue(mockKid);

      const result = await getKidById('kidId', 'userId');
      expect(result).toEqual(mockKid);
      expect(Kid.findOne).toHaveBeenCalledWith({ _id: 'kidId', custodyIDs: 'userId' });
    });

    it('should throw an error if kid is not found', async () => {
      Kid.findOne.mockResolvedValue(null);

      await expect(getKidById('kidId', 'userId')).rejects.toThrow('Kid not found');
    });
  });

  describe('updateKid', () => {
    it('should update and return the updated kid', async () => {
      const mockKid = { _id: 'kidId', name: 'John', custodyIDs: ['userId'] };
      Kid.findOneAndUpdate.mockResolvedValue(mockKid);

      const result = await updateKid('kidId', 'userId', { name: 'Jane' });
      expect(result).toEqual(mockKid);
      expect(Kid.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'kidId', custodyIDs: 'userId' },
        { name: 'Jane' },
        { new: true, runValidators: true }
      );
    });

    it('should throw an error if kid is not found', async () => {
      Kid.findOneAndUpdate.mockResolvedValue(null);

      await expect(updateKid('kidId', 'userId', {})).rejects.toThrow('Kid not found');
    });
  });

  describe('deleteKid', () => {
    it('should delete the kid and return it', async () => {
      const mockKid = { _id: 'kidId', name: 'John' };
      Kid.findOneAndDelete.mockResolvedValue(mockKid);
      User.findByIdAndUpdate.mockResolvedValue(true);

      const result = await deleteKid('kidId', 'userId');
      expect(result).toEqual(mockKid);
      expect(Kid.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'kidId',
        custodyIDs: 'userId',
      });
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('userId', { $pull: { kids: 'kidId' } });
    });

    it('should throw an error if kid is not found or user does not have custody', async () => {
      Kid.findOneAndDelete.mockResolvedValue(null);

      await expect(deleteKid('kidId', 'userId')).rejects.toThrow('Kid not found or you do not have custody');
    });
  });
});