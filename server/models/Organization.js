// models/Organization.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ["bank", "hospital", "other"] },
    branches: [{ type: Types.ObjectId, ref: "Branch" }], // array of branch IDs
    phone: { type: String }, // optional contact number
    logo: { type: String }, // optional icon/logo
  },
  {
    timestamps: true,
  }
);

export default model("Organization", OrganizationSchema);
