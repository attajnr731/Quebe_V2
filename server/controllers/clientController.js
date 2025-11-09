// controllers/clientController.js
import Client from "../models/Client.js";

// PUT /api/clients/:id/credit
export const updateClientCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const { credit } = req.body;

    if (credit === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Credit value is required" });
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
