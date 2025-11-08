// models/Service.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true },
    branch: { type: Types.ObjectId, ref: "Branch", required: true }, // reference to branch
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default model("Service", ServiceSchema);
