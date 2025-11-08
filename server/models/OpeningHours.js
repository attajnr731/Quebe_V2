// models/OpeningHours.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const OpeningHoursSchema = new Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    branch: { type: Types.ObjectId, ref: "Branch" },
  },
  {
    timestamps: true,
  }
);

export default model("OpeningHours", OpeningHoursSchema);
