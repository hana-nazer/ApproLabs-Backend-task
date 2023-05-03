const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// registe new user
exports.postSignUp = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const newUser = new User(req.body);
    await newUser.save();
    res.json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// login user
exports.postLogin = async (req, res) => {
  try {
    // check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: "User does not exist" });
    }

    // check password valid or not
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // token creation
    const token = jwt.sign({ userId: user._id }, process.env.SECRET, {
      expiresIn: "1d",
    });
    res.json({ message: "User logged in successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // Find the current user by ID and exclude password field
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send the user details as the response
    res.json({
      success: true,
      message: "User details fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
