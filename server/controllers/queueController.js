// controllers/queueController.js
import Client from "../models/Client.js";
import Organization from "../models/Organization.js";
import Queue from "../models/Queue.js"; // Assume you have a Queue model

export const joinQueue = async (req, res) => {
  try {
    const { orgId, branchId, notifyAt } = req.body;
    const userId = req.userId;

    if (!orgId || !branchId) {
      return res.status(400).json({
        success: false,
        message: "orgId and branchId are required",
      });
    }

    const client = await Client.findById(userId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const org = await Organization.findById(orgId);
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    const isFree = org.credits === 0;
    const hasCredit = client.credit > 0;

    if (!isFree && !hasCredit) {
      return res.status(403).json({
        success: false,
        message: "Insufficient credits. Please top up.",
      });
    }

    // Deduct credit if not free
    if (!isFree) {
      client.credit -= 1;
      await client.save();
    }

    // Create queue entry (simplified)
    const queueEntry = await Queue.create({
      client: userId,
      organization: orgId,
      branch: branchId,
      notifyAt,
      joinedAt: new Date(),
      status: "waiting",
    });

    res.status(200).json({
      success: true,
      message: "Joined queue successfully",
      queue: queueEntry,
      remainingCredits: client.credit,
    });
  } catch (error) {
    console.error("Join queue error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
