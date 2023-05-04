const userController = require("./userController");
const User = require("../model/userModel");
const validator = require("validator");
const bcrypt = require("bcrypt");

jest.mock("../model/userModel");
jest.mock("validator");
jest.mock("bcrypt");

describe("postSignUp function", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        username: "testuser",
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
    console.log({ userController });
    req.body.username = "";
    req.body.email = "";
    req.body.password = "";
    await userController.postSignUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "All fields are required" });
  });

  it("returns 400 if email format is invalid", async () => {
    validator.isEmail.mockReturnValue(false);
    await userController.postSignUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid email format" });
  });

  it("returns 400 if email already exists", async () => {
    User.findOne.mockReturnValue({ email: req.body.email });
    await userController.postSignUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid email format" });
  });

  it("returns 400 if password length is invalid", async () => {
    validator.isLength.mockReturnValue(false);
    await userController.postSignUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid email format",
    });
  });

  it("returns 400 if username contains special characters", async () => {
    validator.matches.mockReturnValue(false);
    await userController.postSignUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid email format",
    });
  });

  it("returns 200 if user is created successfully", async () => {
    User.findOne.mockReturnValue(null);
    validator.isEmail.mockReturnValue(true);
    validator.isLength.mockReturnValue(true);
    validator.matches.mockReturnValue(true);
    bcrypt.genSalt.mockResolvedValue("testsalt");
    bcrypt.hash.mockResolvedValue("testhashedpassword");
    const saveMock = jest.fn().mockResolvedValue();
    User.mockReturnValue({ save: saveMock });
    await userController.postSignUp(req, res);
    expect(res.json).toHaveBeenCalledWith({
      message: "User created successfully",
    });
  });

  it("returns 500 if there is an internal server error", async () => {
    User.findOne.mockRejectedValue(new Error("test error"));
    await userController.postSignUp(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});
