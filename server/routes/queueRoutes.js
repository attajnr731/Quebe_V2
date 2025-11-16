// routes/queueRoutes.js
import express from "express";
import { joinQueue } from "../controllers/queueController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/join", authenticate, joinQueue);

export default router;
