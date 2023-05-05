const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// Signup
exports.postSignUp = async (req, res) => {
  try {
    // Check if all fields are provided
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Validate password
    if (!validator.isLength(password, { min: 3, max: 15 })) {
      return res
        .status(400)
        .json({ error: "Password must be between 3 and 15 characters long" });
    }

    // Validate username
    if (!validator.matches(username, /^[a-zA-Z0-9_]+$/)) {
      return res.status(400).json({
        error: "Username should not contain special characters except _",
      });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    // saving the user
    const newUser = new User(req.body);
    await newUser.save();
    res.json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login
exports.postLogin = async (req, res) => {
  try {
    // Check if both email and password fields are provided
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "User does not exist" });
    }
   

    // check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }
  
    // token creation
    const token = jwt.sign({ userId: user._id }, process.env.SECRET, {
      expiresIn: "1d",
    });
   

    res.status(200).json({ message: "User logged in successfully", token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { _id, username, email } = user;

    res.status(200).json({
      message: "User details fetched successfully",
      data: {
        _id,
        username,
        email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
