// routes/authRoutes.js
import express from "express";
import { clientSignup, clientLogin } from "../controllers/authController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

// Signup
router.post("/signup", upload.single("photo"), clientSignup);
// Login
router.post("/login", clientLogin);

export default router;
