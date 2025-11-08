// models/Branch.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const BranchSchema = new Schema(
  {
    name: { type: String, required: true },
    organization: { type: Types.ObjectId, ref: "Organization", required: true }, // link to organization
    location: { type: String }, // e.g., "Downtown, Accra"
    phone: { type: String }, // branch contact number
    manager: { type: String }, // branch manager name
    address: { type: String }, // full address
  },
  {
    timestamps: true,
  }
);

export default model("Branch", BranchSchema);
