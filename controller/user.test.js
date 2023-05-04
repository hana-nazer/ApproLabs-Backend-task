const userController = require("./userController");
const User = require("../model/userModel");

jest.mock("../model/userModel");

describe("getCurrentUser function", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        id: "testuserid",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 if user is not found", async () => {
    User.findById.mockResolvedValue(null);
    await userController.getCurrentUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  it("returns user details if user is found", async () => {
    const mockUser = {
      _id: "testuserid",
      username: "testuser",
      email: "testuser@example.com",
      createdAt: "2023-05-03T15:00:00.000Z",
      updatedAt: "2023-05-03T15:00:00.000Z",
    };
    User.findById.mockResolvedValue(mockUser);
    await userController.getCurrentUser(req, res);
    expect(res.json).toHaveBeenCalledWith({
      message: "User details fetched successfully",
      data: {
        _id: "testuserid",
        username: "testuser",
        email: "testuser@example.com",
        createdAt: "2023-05-03T15:00:00.000Z",
        updatedAt: "2023-05-03T15:00:00.000Z",
      },
    });
  });
});
