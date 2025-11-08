// models/Clerk.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const ClerkSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }, // hashed in production!
    branch: { type: Types.ObjectId, ref: "Branch", required: true }, // link to branch
    address: { type: String }, // optional
    email: { type: String }, // optional
  },
  {
    timestamps: true,
  }
);

export default model("Clerk", ClerkSchema);
