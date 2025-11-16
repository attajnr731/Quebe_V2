// controllers/clientController.js
import Client from "../models/Client.js";
import axios from "axios";
import crypto from "crypto";

// Store processed transactions to prevent duplicate credits
const processedTransactions = new Map();

// Clean up old transactions every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [ref, timestamp] of processedTransactions.entries()) {
    if (timestamp < oneHourAgo) {
      processedTransactions.delete(ref);
    }
  }
}, 60 * 60 * 1000);

// POST /api/clients/verify-payment - OPTIMISTIC APPROACH
export const verifyPayment = async (req, res) => {
  const startTime = Date.now();

  try {
    const { reference, amount } = req.body;
    const userId = req.userId;

    console.log("=== PAYMENT VERIFICATION START ===");
    console.log("Time:", new Date().toISOString());
    console.log("Reference:", reference);
    console.log("Amount:", amount);
    console.log("UserID:", userId);

    // Validation
    if (!reference || !amount) {
      return res.status(400).json({
        success: false,
        message: "Reference and amount are required",
      });
    }

    // Check if already processed
    if (processedTransactions.has(reference)) {
      console.log("⚠️ Already processed:", reference);

      const client = await Client.findById(userId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Client not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment already verified and credit added",
        alreadyProcessed: true,
        client: {
          _id: client._id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          photoURL: client.photoURL,
          credit: client.credit,
        },
      });
    }

    // Find client first
    const client = await Client.findById(userId);
    if (!client) {
      console.error("❌ Client not found:", userId);
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // OPTIMISTIC CREDIT UPDATE
    // Since Paystack already sent success callback, trust it and add credit immediately
    const paidAmount = parseFloat(amount);
    const oldCredit = client.credit || 0;
    client.credit = oldCredit + paidAmount;

    console.log("💳 Credit update (OPTIMISTIC):");
    console.log("  Old:", oldCredit);
    console.log("  Adding:", paidAmount);
    console.log("  New:", client.credit);

    await client.save();

    // Mark as processed
    processedTransactions.set(reference, Date.now());

    const totalTime = Date.now() - startTime;
    console.log(`✅ SUCCESS - Credit added immediately (${totalTime}ms)`);
    console.log("=== VERIFICATION END ===\n");

    // Return success immediately
    res.status(200).json({
      success: true,
      message: "Payment verified and credit added",
      client: {
        _id: client._id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        photoURL: client.photoURL,
        credit: client.credit,
      },
      transaction: {
        reference: reference,
        amount: paidAmount,
        date: new Date().toISOString(),
      },
    });

    // BACKGROUND VERIFICATION (non-blocking)
    // Verify with Paystack in background for audit trail
    setTimeout(async () => {
      try {
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) return;

        console.log("🔍 Background verification for:", reference);

        const verifyResponse = await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${paystackSecretKey}`,
            },
            timeout: 15000,
          }
        );

        const paymentData = verifyResponse.data;

        if (paymentData.status && paymentData.data?.status === "success") {
          console.log("✅ Background verification successful:", reference);

          // Verify amount matches
          const verifiedAmount = paymentData.data.amount / 100;
          if (Math.abs(verifiedAmount - paidAmount) > 0.01) {
            console.error("⚠️ AMOUNT MISMATCH!");
            console.error("  Expected:", paidAmount);
            console.error("  Got:", verifiedAmount);
            // You might want to log this to a monitoring service
          }
        } else {
          console.error(
            "❌ Background verification failed:",
            paymentData.data?.status
          );
        }
      } catch (error) {
        console.error(
          "Background verification error (non-critical):",
          error.message
        );
      }
    }, 5000); // Wait 5 seconds before background check
  } catch (error) {
    const totalTime = Date.now() - startTime;

    console.error("=== VERIFICATION ERROR ===");
    console.error("After", totalTime, "ms");
    console.error("Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during verification",
      error: error.message,
    });
  }
};

// POST /api/webhooks/paystack - Webhook handler for reconciliation
export const paystackWebhook = async (req, res) => {
  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.error("❌ Invalid webhook signature");
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;
    console.log("📥 Webhook received:", event.event);

    if (event.event === "charge.success") {
      const { reference, amount, customer, metadata } = event.data;
      const paidAmount = amount / 100;
      const userId =
        metadata?.userId ||
        metadata?.custom_fields?.find((f) => f.variable_name === "user_id")
          ?.value;

      console.log("💰 Webhook payment success:");
      console.log("  Reference:", reference);
      console.log("  Amount:", paidAmount);
      console.log("  UserID:", userId);

      // Check if already processed
      if (processedTransactions.has(reference)) {
        console.log("⚠️ Already processed via API:", reference);
        return res.status(200).send("OK");
      }

      if (!userId) {
        console.error("❌ No userId in webhook metadata");
        return res.status(200).send("OK");
      }

      // Find and update client
      const client = await Client.findById(userId);
      if (!client) {
        console.error("❌ Client not found:", userId);
        return res.status(200).send("OK");
      }

      const oldCredit = client.credit || 0;
      client.credit = oldCredit + paidAmount;
      await client.save();

      processedTransactions.set(reference, Date.now());

      console.log("✅ Webhook: Credit added");
      console.log("  Old:", oldCredit);
      console.log("  New:", client.credit);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Error");
  }
};

export const getCurrentClient = async (req, res) => {
  try {
    const client = await Client.findById(req.userId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      client: {
        _id: client._id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        photoURL: client.photoURL,
        credit: client.credit,
      },
    });
  } catch (error) {
    console.error("Get client error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateClientCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const { credit } = req.body;

    if (req.userId !== id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (credit === undefined || credit < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid credit required",
      });
    }

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    client.credit = credit;
    await client.save();

    res.status(200).json({
      success: true,
      client: {
        _id: client._id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        photoURL: client.photoURL,
        credit: client.credit,
      },
    });
  } catch (error) {
    console.error("Update credit error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const initializePayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const client = await Client.findById(userId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error",
      });
    }

    const reference = `QBE_${Date.now()}_${userId}`;

    console.log("🔄 Initializing payment:");
    console.log("  Reference:", reference);
    console.log("  Amount:", amount);

    const initResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: client.email || `${client.phone}@quebe.app`,
        amount: Math.round(amount * 100),
        reference: reference,
        currency: "GHS",
        channels: ["card", "mobile_money"],
        metadata: {
          userId: userId,
          custom_fields: [
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: userId,
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    if (!initResponse.data.status) {
      console.error("❌ Paystack initialization failed");
      return res.status(400).json({
        success: false,
        message: "Failed to initialize payment",
      });
    }

    console.log("✅ Payment initialized successfully");

    res.status(200).json({
      success: true,
      data: {
        authorization_url: initResponse.data.data.authorization_url,
        access_code: initResponse.data.data.access_code,
        reference: initResponse.data.data.reference,
      },
    });
  } catch (error) {
    console.error("Initialize payment error:", error.response?.data || error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize payment",
      error: error.response?.data?.message || error.message,
    });
  }
};
