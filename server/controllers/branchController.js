// controllers/branchController.js
import Branch from "../models/Branch.js";
import Organization from "../models/Organization.js";

/**
 * @desc Get all branches for a specific organization
 * @route GET /api/branches/:organizationId
 */
export const getBranchesByOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const branches = await Branch.find({ organization: organizationId });

    res.status(200).json({
      success: true,
      count: branches.length,
      branches,
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Create a new branch under an organization
 * @route POST /api/branches
 */
export const createBranch = async (req, res) => {
  try {
    const { name, organization, location, phone, manager, address } = req.body;

    if (!name || !organization) {
      return res
        .status(400)
        .json({ message: "Name and organization are required" });
    }

    // Check if organization exists
    const orgExists = await Organization.findById(organization);
    if (!orgExists) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Create branch
    const branch = new Branch({
      name,
      organization,
      location,
      phone,
      manager,
      address,
    });

    await branch.save();

    // Push branch ID into organization’s branches array
    orgExists.branches.push(branch._id);
    await orgExists.save();

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      branch,
    });
  } catch (error) {
    console.error("Error creating branch:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Edit branch details
 * @route PUT /api/branches/:id
 */
export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const branch = await Branch.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      branch,
    });
  } catch (error) {
    console.error("Error updating branch:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
