// routes/clientRoutes.js
import express from "express";
import {
  updateClientCredit,
  verifyPayment,
  getCurrentClient, // Add this
} from "../controllers/clientController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get current user (protected route)
router.get("/me", authenticate, getCurrentClient); // Add this line

// Update client credit (protected route)
router.put("/:id/credit", authenticate, updateClientCredit);

// Verify payment and add credit
router.post("/verify-payment", authenticate, verifyPayment);

export default router;
