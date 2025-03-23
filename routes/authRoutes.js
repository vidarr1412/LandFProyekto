const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/User"); 

const router = express.Router();
const SECRET_KEY = "polgary"; // Replace with your actual secret key

// User Signup
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, usertype, contactNumber, college, year_lvl } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      contactNumber,
      email,
      password: hashedPassword,
      usertype: "student",
      college,
      year_lvl,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error saving user to MongoDB:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

// Get User Profile
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Error fetching profile" });
  }
});

// Update User Profile
router.put("/update-profile/:userId", async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, password, contactNumber, image_Url, college, year_lvl } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.image_Url = image_Url;
    user.contactNumber = contactNumber;
    user.college = college;
    user.year_lvl = year_lvl;

    // Hash password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        college: user.college,
        contactNumber: user.contactNumber,
        usertype: user.usertype,
        firstName: user.firstName,
        lastName: user.lastName,
        year_lvl: user.year_lvl,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

module.exports = router;
