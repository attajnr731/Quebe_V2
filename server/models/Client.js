import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ClientSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    photoURL: { type: String },
    credit: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default model("Client", ClientSchema);
