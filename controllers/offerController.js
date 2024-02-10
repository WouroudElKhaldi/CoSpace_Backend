import mongoose from "mongoose";
import Offer from "../models/offersModel.js";
import Space from "../models/spaceModel.js";
import Room from "../models/roomModel.js";

// Controller for adding a new offer
export const addOffer = async (req, res) => {
  try {
    const { percentage, type, roomId, startDate, endDate } = req.body;

    if (!percentage || !type || !roomId || !startDate || !endDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate percentage
    if (percentage < 0.1 || percentage > 100) {
      return res
        .status(400)
        .json({ error: "Percentage must be between 0.1 and 100" });
    }

    // Validate type
    if (!["spaceOffer", "roomOffer"].includes(type)) {
      return res.status(400).json({ error: "Invalid offer type" });
    }

    // Validate roomId
    if (!mongoose.isValidObjectId(roomId)) {
      return res.status(400).json({ error: "Invalid room ID" });
    }

    let spaceId;

    if (type === "roomOffer") {
      // Find the room by ID and populate spaceId
      const room = await Room.findById(roomId).populate("spaceId");

      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // Get spaceId from the populated room
      spaceId = room.spaceId;

      // Find the space by spaceId and get the name
      const space = await Space.findById(spaceId);

      if (!space) {
        return res.status(404).json({ error: "Space not found" });
      }

      const newOffer = await Offer.create({
        percentage,
        type,
        spaceId,
        roomId,
      });

      return res.status(200).json(newOffer);
    }

    if (type === "spaceOffer") {
      spaceId = req.body.spaceId;

      // Validate spaceId
      if (!mongoose.isValidObjectId(spaceId)) {
        return res.status(400).json({ error: "Invalid space ID" });
      }

      // Find the space by spaceId
      const space = await Space.findById(spaceId);

      if (!space) {
        return res.status(404).json({ error: "Space not found" });
      }

      const newOffer = await Offer.create({ percentage, type, spaceId });

      return res.status(200).json(newOffer);
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for editing an offer
export const editOffer = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid offer ID" });
    }

    const { percentage, type, spaceId, roomId } = req.body;

    // Validate percentage
    if (percentage && (percentage < 0.1 || percentage > 100)) {
      return res
        .status(400)
        .json({ error: "Percentage must be between 0.1 and 100" });
    }

    // Validate type
    if (type && !["spaceOffer", "roomOffer"].includes(type)) {
      return res.status(400).json({ error: "Invalid offer type" });
    }

    // Validate spaceId and roomId based on type
    if (type === "spaceOffer" && !spaceId) {
      return res
        .status(400)
        .json({ error: "Space ID is required for space offer" });
    }

    if (type === "roomOffer" && !roomId) {
      return res
        .status(400)
        .json({ error: "Room ID is required for room offer" });
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      {
        percentage: percentage,
      },
      { new: true }
    );

    if (!updatedOffer) {
      return res.status(404).json({ error: "Offer not found" });
    }

    return res.status(200).json(updatedOffer);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for deleting an offer
export const deleteOffer = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid offer ID" });
    }

    const deletedOffer = await Offer.findByIdAndDelete(id);

    if (!deletedOffer) {
      return res.status(404).json({ error: "Offer not found" });
    }

    return res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all offers
export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    return res.json(offers);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting one offer by ID
export const getOneOffer = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid offer ID" });
    }

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }

    return res.status(200).json(offer);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};
