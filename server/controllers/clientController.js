// controllers/clientController.js
import Client from "../models/Client.js";
import axios from "axios";

// PUT /api/clients/:id/credit
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

// POST /api/clients/verify-payment
export const verifyPayment = async (req, res) => {
  try {
    const { reference, amount } = req.body;
    const userId = req.userId;

    if (!reference || !amount) {
      return res.status(400).json({
        success: false,
        message: "Reference and amount are required",
      });
    }

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    try {
      const verifyResponse = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        }
      );

      const paymentData = verifyResponse.data;

      if (paymentData.status && paymentData.data.status === "success") {
        const paidAmount = paymentData.data.amount / 100; // Convert from kobo/pesewas to cedis

        // Verify the amount matches
        if (Math.abs(paidAmount - parseFloat(amount)) > 0.01) {
          return res.status(400).json({
            success: false,
            message: "Payment amount mismatch",
          });
        }

        // Update client credit
        const client = await Client.findById(userId);
        if (!client) {
          return res.status(404).json({
            success: false,
            message: "Client not found",
          });
        }

        client.credit = (client.credit || 0) + paidAmount;
        await client.save();

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
        return res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      }
    } catch (paystackError) {
      console.error("Paystack verification error:", paystackError);
      return res.status(500).json({
        success: false,
        message: "Failed to verify payment with Paystack",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
