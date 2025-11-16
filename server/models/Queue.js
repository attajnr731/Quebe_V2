// models/Queue.js
import mongoose from "mongoose";

const QueueSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Types.ObjectId, ref: "Client", required: true },
    organization: {
      type: mongoose.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    branch: { type: mongoose.Types.ObjectId, ref: "Branch", required: true },
    notifyAt: { type: Number },
    joinedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["waiting", "notified", "served"],
      default: "waiting",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Queue", QueueSchema);
