// routes/branchRoutes.js
import express from "express";
import {
  getBranchesByOrganization,
  createBranch,
  updateBranch,
} from "../controllers/branchController.js";

const router = express.Router();

// GET /api/branches/:organizationId → fetch all branches for org
router.get("/:organizationId", getBranchesByOrganization);

// POST /api/branches → create branch
router.post("/", createBranch);

// PUT /api/branches/:id → edit branch
router.put("/:id", updateBranch);

export default router;
