const { getCurrentUser } = require('./userController');
const User = require('../model/userModel');

describe('getCurrentUser', () => {
  it('should return user details when given a valid user ID', async () => {
    const user = {
      _id: '123',
      username: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123'
    };
    jest.spyOn(User, 'findById').mockResolvedValue(user);

    const req = { params: { id: '123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getCurrentUser(req, res);

    expect(User.findById).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User details fetched successfully',
      data: {
        _id: '123',
        username: 'John Doe',
        email: 'johndoe@example.com'
      }
    });
  });

  it('should return 404 error when given an invalid user ID', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(null);

    const req = { params: { id: '456' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getCurrentUser(req, res);

    expect(User.findById).toHaveBeenCalledWith('456');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should return 500 error when an internal server error occurs', async () => {
    jest.spyOn(User, 'findById').mockRejectedValue(new Error('Database error'));

    const req = { params: { id: '123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getCurrentUser(req, res);

    expect(User.findById).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
