// routes/clientRoutes.js
import express from "express";
import { updateClientCredit } from "../controllers/clientController.js";

const router = express.Router();

// Update client credit
router.put("/:id/credit", updateClientCredit);

export default router;
