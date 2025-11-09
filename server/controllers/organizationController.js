// controllers/organizationController.js
import Organization from "../models/Organization.js";

/**
 * @desc Create a new organization
 * @route POST /api/organizations
 */
export const createOrganization = async (req, res) => {
  try {
    const { name, type, phone, logo } = req.body;

    // basic validation
    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }

    const organization = new Organization({
      name,
      type,
      phone,
      logo,
      branches: [], // start with no branches
    });

    await organization.save();

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
