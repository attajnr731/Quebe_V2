// routes/authRoutes.js
import express from "express";
import { clientSignup, clientLogin } from "../controllers/authController.js";

const router = express.Router();

// Signup
router.post("/signup", clientSignup);

// Login
router.post("/login", clientLogin);

export default router;
