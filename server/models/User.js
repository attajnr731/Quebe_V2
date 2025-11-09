// models/User.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hash this before saving
    phone: { type: String },
    address: { type: String },
    branch: { type: Types.ObjectId, ref: "Branch", required: true }, // the branch they manage
  },
  {
    timestamps: true,
  }
);

export default model("User", UserSchema);
