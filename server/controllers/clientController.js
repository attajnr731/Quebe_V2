// controllers/clientController.js
import Client from "../models/Client.js";
import axios from "axios";

// POST /api/clients/verify-payment
export const verifyPayment = async (req, res) => {
  try {
    const { reference, amount } = req.body;
    const userId = req.userId;

    console.log("Verifying payment:", { reference, amount, userId });

    if (!reference || !amount) {
      return res.status(400).json({
        success: false,
        message: "Reference and amount are required",
      });
    }

    // Check if Paystack secret key exists
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY not found in environment variables");
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error",
      });
    }

    console.log("Making request to Paystack...");

    // Verify payment with Paystack
    try {
      const verifyResponse = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log("Paystack response:", verifyResponse.data);

      const paymentData = verifyResponse.data;

      if (paymentData.status && paymentData.data.status === "success") {
        const paidAmount = paymentData.data.amount / 100; // Convert from kobo/pesewas to cedis

        console.log("Payment verified successfully:", {
          reference: paymentData.data.reference,
          paidAmount,
          requestedAmount: amount,
        });

        // Verify the amount matches (allow small rounding differences)
        if (Math.abs(paidAmount - parseFloat(amount)) > 0.01) {
          console.error("Amount mismatch:", {
            paidAmount,
            requestedAmount: amount,
          });
          return res.status(400).json({
            success: false,
            message: "Payment amount mismatch",
          });
        }

        // Update client credit
        const client = await Client.findById(userId);
        if (!client) {
          console.error("Client not found:", userId);
          return res.status(404).json({
            success: false,
            message: "Client not found",
          });
        }

        const oldCredit = client.credit || 0;
        client.credit = oldCredit + paidAmount;
        await client.save();

        console.log("Credit updated:", {
          clientId: client._id,
          oldCredit,
          newCredit: client.credit,
          addedAmount: paidAmount,
        });

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
      } else {
        console.error("Payment not successful:", paymentData);
        return res.status(400).json({
          success: false,
          message: "Payment verification failed - transaction not successful",
        });
      }
    } catch (paystackError) {
      // Log detailed error information
      console.error("Paystack verification error:", {
        message: paystackError.message,
        response: paystackError.response?.data,
        status: paystackError.response?.status,
        reference,
      });

      // Return detailed error to help debugging
      const errorMessage =
        paystackError.response?.data?.message ||
        paystackError.message ||
        "Failed to verify payment with Paystack";

      return res.status(500).json({
        success: false,
        message: errorMessage,
        details: paystackError.response?.data || "No additional details",
      });
    }
  } catch (error) {
    console.error("Error in verifyPayment controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// PUT /api/clients/:id/credit (keep this as is)
export const updateClientCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const { credit } = req.body;

    // Check if the authenticated user matches the client being updated
    if (req.userId !== id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this client",
      });
    }

    if (credit === undefined || credit < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid credit value is required" });
    }

    const client = await Client.findById(id);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};
