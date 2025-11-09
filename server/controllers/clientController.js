// controllers/clientController.js
import Client from "../models/Client.js";
import axios from "axios";

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

// POST /api/clients/verify-payment
export const verifyPayment = async (req, res) => {
  const startTime = Date.now();

  try {
    const { reference, amount } = req.body;
    const userId = req.userId;

    console.log("=== PAYMENT VERIFICATION START ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Reference:", reference);
    console.log("Amount:", amount);
    console.log("UserID:", userId);

    // Validation
    if (!reference || !amount) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Reference and amount are required",
      });
    }

    // Check if already processed
    if (processedTransactions.has(reference)) {
      console.log("⚠️ Transaction already processed:", reference);

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

    // Check Paystack secret key
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.error("❌ PAYSTACK_SECRET_KEY not configured");
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error",
      });
    }

    console.log("📡 Calling Paystack API...");
    const paystackStartTime = Date.now();

    // Verify with Paystack
    const verifyResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
        timeout: 15000,
      }
    );

    const paystackDuration = Date.now() - paystackStartTime;
    console.log(`✅ Paystack responded in ${paystackDuration}ms`);

    const paymentData = verifyResponse.data;

    // Check response status
    if (!paymentData.status) {
      console.error("❌ Paystack returned false status");
      return res.status(400).json({
        success: false,
        message: paymentData.message || "Payment verification failed",
      });
    }

    // Check transaction status
    const txStatus = paymentData.data?.status;
    console.log("Transaction status:", txStatus);

    if (txStatus !== "success") {
      console.error(`❌ Transaction not successful: ${txStatus}`);
      return res.status(400).json({
        success: false,
        message: `Payment status: ${txStatus}`,
        details: "Transaction was not successful",
        status: txStatus,
      });
    }

    // Verify amount
    const paidAmount = paymentData.data.amount / 100;
    const requestedAmount = parseFloat(amount);

    console.log("💰 Amount verification:");
    console.log("  Paid:", paidAmount);
    console.log("  Requested:", requestedAmount);

    if (Math.abs(paidAmount - requestedAmount) > 0.01) {
      console.error("❌ Amount mismatch");
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
        expected: requestedAmount,
        received: paidAmount,
      });
    }

    // Find client
    console.log("🔍 Finding client:", userId);
    const client = await Client.findById(userId);

    if (!client) {
      console.error("❌ Client not found:", userId);
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Update credit
    const oldCredit = client.credit || 0;
    client.credit = oldCredit + paidAmount;

    console.log("💳 Updating credit:");
    console.log("  Old balance:", oldCredit);
    console.log("  Adding:", paidAmount);
    console.log("  New balance:", client.credit);

    await client.save();

    // Mark as processed
    processedTransactions.set(reference, Date.now());

    const totalDuration = Date.now() - startTime;
    console.log(`✅ VERIFICATION SUCCESSFUL (${totalDuration}ms)`);
    console.log("=== PAYMENT VERIFICATION END ===\n");

    return res.status(200).json({
      success: true,
      message: "Payment verified and credit added successfully",
      client: {
        _id: client._id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        photoURL: client.photoURL,
        credit: client.credit,
      },
      transaction: {
        reference: paymentData.data.reference,
        amount: paidAmount,
        date: paymentData.data.paid_at,
        status: txStatus,
      },
      processingTime: totalDuration,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    console.error("=== PAYMENT VERIFICATION ERROR ===");
    console.error("Error after", totalDuration, "ms");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);

    // Axios/Network errors
    if (error.response) {
      console.error("Paystack API error:");
      console.error("  Status:", error.response.status);
      console.error("  Data:", error.response.data);

      return res.status(error.response.status || 500).json({
        success: false,
        message:
          error.response.data?.message ||
          "Payment verification failed with Paystack",
        details: error.response.data,
      });
    }

    // Timeout errors
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      console.error("⏱️ Request timeout");
      return res.status(408).json({
        success: false,
        message: "Payment verification timed out. Please try again.",
        code: "TIMEOUT",
      });
    }

    // Network errors
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      console.error("🌐 Network error");
      return res.status(503).json({
        success: false,
        message: "Cannot reach payment gateway. Please try again.",
        code: "NETWORK_ERROR",
      });
    }

    // Generic error
    console.error("Stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Server error during payment verification",
      error: error.message,
    });
  }
};

// PUT /api/clients/:id/credit
export const updateClientCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const { credit } = req.body;

    if (req.userId !== id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this client",
      });
    }

    if (credit === undefined || credit < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid credit value is required",
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
    console.error("Error updating client credit:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /api/clients/me
export const getCurrentClient = async (req, res) => {
  try {
    const userId = req.userId;

    const client = await Client.findById(userId);
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
    console.error("Error getting current client:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
