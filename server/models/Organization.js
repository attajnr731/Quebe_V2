// models/Organization.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

/**
 * Organization Model
 *
 * Represents a business or institution that manages multiple branches.
 *
 * @field credits - Number of queue credits available for this organization.
 *                  Default: 1 (allows 1 active queue per organization unless upgraded).
 *
 * @author Your Name / Team
 * @updated November 16, 2025
 */
const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["bank", "hospital", "government", "other"],
    },
    branches: [{ type: Types.ObjectId, ref: "Branch" }],
    phone: { type: String },
    logo: { type: String },

    // Credits system: controls how many queues the organization can run
    credits: {
      type: Number,
      required: true,
      default: 1,
      min: [0, "Credits cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Index for efficient querying by credits
OrganizationSchema.index({ credits: 1 });

export default model("Organization", OrganizationSchema);
