import crypto from "crypto";
import Client from "../models/Client.js";

export const handlePaystackWebhook = async (req, res) => {
  try {
    console.log("=== WEBHOOK RECEIVED ===");
    console.log("Timestamp:", new Date().toISOString());

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.error("❌ Invalid webhook signature");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;
    console.log("Event type:", event.event);

    // Handle successful charge
    if (event.event === "charge.success") {
      const { reference, amount, customer, metadata } = event.data;

      console.log("💰 Charge success webhook:");
      console.log("  Reference:", reference);
      console.log("  Amount:", amount / 100);
      console.log("  Customer:", customer.email);
      console.log("  Metadata:", metadata);

      // Try to get userId from metadata first (more reliable)
      let userId = metadata?.userId || metadata?.user_id;

      // Fallback: extract from reference if it follows our pattern
      if (!userId && reference.includes("_")) {
        const parts = reference.split("_");
        // Format could be QUEUE_timestamp_userId
        if (parts.length >= 3) {
          userId = parts[2];
        }
      }

      if (!userId) {
        console.error(
          "❌ User ID not found in metadata or reference:",
          reference
        );
        return res.status(400).send("User ID not found");
      }

      console.log("🔍 Looking for user:", userId);

      // Find and update client
      const client = await Client.findById(userId);
      if (!client) {
        console.error("❌ Client not found:", userId);
        return res.status(404).send("Client not found");
      }

      const creditAmount = amount / 100; // Convert from kobo/pesewas
      const oldCredit = client.credit || 0;
      client.credit = oldCredit + creditAmount;

      await client.save();

      console.log("✅ Credit updated via webhook:");
      console.log("  Client:", client._id);
      console.log("  Old balance:", oldCredit);
      console.log("  Added:", creditAmount);
      console.log("  New balance:", client.credit);
      console.log("=== WEBHOOK PROCESSED ===\n");

      return res.status(200).send("Webhook processed successfully");
    }

    console.log("ℹ️ Unhandled event type:", event.event);
    res.status(200).send("Event received");
  } catch (error) {
    console.error("=== WEBHOOK ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).send("Webhook processing failed");
  }
};
