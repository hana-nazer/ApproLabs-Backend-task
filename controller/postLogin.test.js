const userController = require("./userController");
const User = require("../model/userModel");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

jest.mock("../model/userModel");
jest.mock("validator");
jest.mock("bcrypt");

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
  
    it("returns 400 if email format is invalid", async () => {
      validator.isEmail.mockReturnValue(false);
      await userController.postLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid email format" });
    });
  
    it("returns 400 if user does not exist", async () => {
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
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "User does not exist" });
    });
  
    it("returns 400 if password is invalid", async () => {
      User.findOne.mockReturnValue({
        email: "testuser@example.com",
        password: "correctpassword",
      });
      bcrypt.compare.mockReturnValue(false);
      await userController.postLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid password" });
    });
  
    it("returns 200 and token if login is successful", async () => {
      User.findOne.mockReturnValue({
        email: "testuser@example.com",
        password: "correctpassword",
      });
      bcrypt.compare.mockReturnValue(true);
      const mockToken = "mockToken";
      jest.spyOn(jwt, "sign").mockReturnValue(mockToken);
      await userController.postLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User logged in successfully",
        token: mockToken,
      });
    });
  });
  