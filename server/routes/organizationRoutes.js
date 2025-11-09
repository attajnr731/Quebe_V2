// routes/organizationRoutes.js
import express from "express";
import { createOrganization } from "../controllers/organizationController.js";

const router = express.Router();

// POST /api/organizations
router.post("/", createOrganization);

export default router;
