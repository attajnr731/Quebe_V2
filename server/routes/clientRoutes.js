// routes/clientRoutes.js
import express from "express";
import {
  updateClientCredit,
  verifyPayment,
  getCurrentClient,
  initializePayment,
  paystackWebhook,
} from "../controllers/clientController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public webhook route (no auth needed - Paystack calls this)
router.post("/webhooks/paystack", paystackWebhook);

// Authenticated routes
router.get("/me", authenticate, getCurrentClient);
router.put("/:id/credit", authenticate, updateClientCredit);
router.post("/verify-payment", authenticate, verifyPayment);
router.post("/initialize-payment", authenticate, initializePayment);

export default router;
