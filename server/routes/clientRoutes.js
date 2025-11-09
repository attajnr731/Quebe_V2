// routes/clientRoutes.js
import express from "express";
import {
  updateClientCredit,
  verifyPayment,
} from "../controllers/clientController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Update client credit (protected route)
router.put("/:id/credit", authenticate, updateClientCredit);

// Verify payment and add credit
router.post("/verify-payment", authenticate, verifyPayment);

export default router;
