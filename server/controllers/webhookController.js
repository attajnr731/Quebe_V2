// controllers/webhookController.js
import crypto from "crypto";
import Client from "../models/Client.js";

export const handlePaystackWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.error("Invalid webhook signature");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;

    // Handle successful charge
    if (event.event === "charge.success") {
      const { reference, amount, customer, metadata } = event.data;

      console.log("Webhook received - charge.success:", {
        reference,
        amount: amount / 100,
        customer: customer.email,
      });

      // Extract user ID from reference (format: QUEUE_timestamp_userId)
      const userId = reference.split("_")[2];

      if (!userId) {
        console.error("User ID not found in reference:", reference);
        return res.status(400).send("Invalid reference format");
      }

      // Find and update client
      const client = await Client.findById(userId);
      if (!client) {
        console.error("Client not found:", userId);
        return res.status(404).send("Client not found");
      }

      const creditAmount = amount / 100; // Convert from kobo/pesewas
      client.credit = (client.credit || 0) + creditAmount;
      await client.save();

      console.log("Credit updated via webhook:", {
        clientId: client._id,
        newCredit: client.credit,
        addedAmount: creditAmount,
      });

      return res.status(200).send("Webhook processed");
    }

    res.status(200).send("Event received");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook processing failed");
  }
};
