// routes/clientRoutes.js
import express from "express";
import {
  updateClientCredit,
  verifyPayment,
  getCurrentClient,
  initializePayment,
} from "../controllers/clientController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authenticate, getCurrentClient);

router.put("/:id/credit", authenticate, updateClientCredit);

router.post("/verify-payment", authenticate, verifyPayment);

router.post("/initialize-payment", authenticate, initializePayment);

export default router;
