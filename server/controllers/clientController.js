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

    // Get Paystack secret key
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.error("❌ PAYSTACK_SECRET_KEY not configured");
      return res.status(500).json({
        success: false,
        message: "Payment gateway not configured",
      });
    }

    console.log("📡 Calling Paystack API...");

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

    console.log("✅ Paystack responded");

    const paymentData = verifyResponse.data;

    // Check status
    if (!paymentData.status || paymentData.data?.status !== "success") {
      console.error("❌ Payment not successful:", paymentData.data?.status);
      return res.status(400).json({
        success: false,
        message: `Payment not successful: ${
          paymentData.data?.status || "unknown"
        }`,
      });
    }

    // Verify amount
    const paidAmount = paymentData.data.amount / 100;
    const requestedAmount = parseFloat(amount);

    console.log("💰 Amount check:");
    console.log("  Paid:", paidAmount);
    console.log("  Requested:", requestedAmount);

    if (Math.abs(paidAmount - requestedAmount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch",
        expected: requestedAmount,
        received: paidAmount,
      });
    }

    // Find client
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

    console.log("💳 Credit update:");
    console.log("  Old:", oldCredit);
    console.log("  Adding:", paidAmount);
    console.log("  New:", client.credit);

    await client.save();

    // Mark as processed
    processedTransactions.set(reference, Date.now());

    const totalTime = Date.now() - startTime;
    console.log(`✅ SUCCESS (${totalTime}ms)`);
    console.log("=== VERIFICATION END ===\n");

    return res.status(200).json({
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
        reference: paymentData.data.reference,
        amount: paidAmount,
        date: paymentData.data.paid_at,
      },
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;

    console.error("=== VERIFICATION ERROR ===");
    console.error("After", totalTime, "ms");
    console.error("Error:", error.message);

    if (error.response) {
      console.error("Paystack error:", error.response.data);
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data?.message || "Paystack verification failed",
        details: error.response.data,
      });
    }

    if (error.code === "ECONNABORTED") {
      return res.status(408).json({
        success: false,
        message: "Request timeout",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during verification",
      error: error.message,
    });
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

// PUT /api/clients/:id/credit (manual credit update)
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

// POST /api/clients/initialize-payment
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

    // Generate unique reference
    const reference = `QBE_${Date.now()}_${userId}`;

    console.log("🔄 Initializing payment:");
    console.log("  Reference:", reference);
    console.log("  Amount:", amount);
    console.log("  Email:", "attajnr731@gmail.com");

    // Initialize transaction with Paystack
    const initResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: "attajnr731@gmail.com",
        amount: Math.round(amount * 100), // Convert to pesewas/kobo
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
