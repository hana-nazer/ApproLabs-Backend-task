const userController = require("./userController");
const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../model/userModel");
jest.mock("validator");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("postLogin function", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        email: "testuser@example.com",
        password: "testpassword",
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

  it("returns 400 if all fields are not provided", async () => {
    req.body.email = "";
    req.body.password = "";
    await userController.postLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "All fields are required" });
  });

  it("returns 401 if user does not exist", async () => {
    const req = {
      body: {
        email: "nonexistentuser@example.com",
        password: "password123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    User.findOne.mockResolvedValue(null);

    await userController.postLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "User does not exist" });
  });

  it("returns 401 if password is invalid", async () => {
    User.findOne.mockReturnValue({
      email: "testuser@example.com",
      password: "correctpassword",
    });
    bcrypt.compare.mockReturnValue(false);
    await userController.postLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid password" });
  });

  it("returns a token when user is authenticated", async () => {
    User.findOne.mockReturnValue({
      email: "test@example.com",
      password: "123",
    });
    bcrypt.compare.mockReturnValue(true);
    jwt.sign.mockReturnValue("testtoken");
    await userController.postLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User logged in successfully",
      token: "testtoken",
    });
  });

  it("returns 500 if there is an internal server error", async () => {
    User.findOne.mockRejectedValue(new Error("test error"));
    await userController.postLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});
