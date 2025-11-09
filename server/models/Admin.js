// models/Admin.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const AdminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    organization: { type: Types.ObjectId, ref: "Organization", required: true },
  },
  {
    timestamps: true,
  }
);

export default model("Admin", AdminSchema);
