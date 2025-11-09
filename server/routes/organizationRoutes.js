// routes/organizationRoutes.js
import express from "express";
import {
  createOrganization,
  getAllOrganizations,
} from "../controllers/organizationController.js";

const router = express.Router();

// GET all organizations
router.get("/", getAllOrganizations);

// POST /api/organizations
router.post("/", createOrganization);

export default router;
