// models/Organization.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

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
  },
  {
    timestamps: true,
  }
);

export default model("Organization", OrganizationSchema);
