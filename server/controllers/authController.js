// controllers/authController.js
import Client from "../models/Client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const clientSignup = async (req, res) => {
  try {
    const { name, phone, password, email, photoURL } = req.body;

    // Validate
    if (!name || !phone || !password || !email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingClient = await Client.findOne({ phone });
    if (existingClient) {
      return res
        .status(400)
        .json({ success: false, message: "Client already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const client = new Client({
      name,
      phone,
      password: hashedPassword,
      email,
      photoURL,
      credit: 0,
    });

    await client.save();

    // === GENERATE JWT TOKEN ON SIGNUP ===
    const token = jwt.sign(
      { id: client._id, phone: client.phone },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token, // ← ADD THIS
      client: {
        _id: client._id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        photoURL: client.photoURL,
        credit: client.credit,
      },
    });
  } catch (error) {
    console.error("Error signing up client:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/auth/login
export const clientLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and password are required" });
    }

    const client = await Client.findOne({ phone });
    if (!client) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: client._id, phone: client.phone },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      client: {
        _id: client._id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        photoURL: client.photoURL,
        credit: client.credit, // ✅ include credit
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in client:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
