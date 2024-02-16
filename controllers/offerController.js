import mongoose from "mongoose";
import Offer from "../models/offersModel.js";
import Space from "../models/spaceModel.js";
import Service from "../models/serviceModel.js";
import Notification from "../models/notificationModel.js";

// Controller for adding a new offer
export const addOffer = async (req, res) => {
  try {
    const { percentage, type, serviceId, startDate, endDate } = req.body;

    if (!percentage || !type || !startDate || !endDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate percentage
    if (percentage < 0.1 || percentage > 100) {
      return res
        .status(400)
        .json({ error: "Percentage must be between 0.1 and 100" });
    }

    // Validate type
    if (!["spaceOffer", "serviceOffer"].includes(type)) {
      return res.status(400).json({ error: "Invalid offer type" });
    }

    let spaceId;

    if (type === "serviceOffer") {
      if (!serviceId) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Validate serviceId
      if (!mongoose.isValidObjectId(serviceId)) {
        return res.status(400).json({ error: "Invalid service Id" });
      }

      const service = await Service.findById(serviceId).populate("spaceId");

      if (!service) {
        return res.status(404).json({ error: "service not found" });
      }

      // Get spaceId from the populated service
      spaceId = service.spaceId;

      // Find the space by spaceId and get the name
      const space = await Space.findById(spaceId);

      if (!space) {
        return res.status(404).json({ error: "Space not found" });
      }

      // Check for overlapping offers
      const existingOffer = await Offer.findOne({
        type: "serviceOffer",
        serviceId: serviceId,
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      });

      if (existingOffer) {
        return res
          .status(400)
          .json({ error: "Service already has an offer during this period" });
      }

      const newOffer = await Offer.create({
        percentage,
        type,
        spaceId,
        serviceId,
        startDate,
        endDate,
      });

      const notification = await Notification.create({
        offerId: newOffer._id,
        message: `Don't miss ${newOffer.percentage}% off on this service: ${service.name} in ${space.name} Space`,
      });

      return res.status(200).json({
        offer: newOffer,
        notification: notification,
      });
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

      // Check for overlapping offers
      const existingOffer = await Offer.findOne({
        type: "spaceOffer",
        spaceId: spaceId,
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      });

      if (existingOffer) {
        return res
          .status(400)
          .json({ error: "Space already has an offer during this period" });
      }

      const newOffer = await Offer.create({
        percentage,
        type,
        spaceId,
        startDate,
        endDate,
      });

      const notification = await Notification.create({
        offerId: newOffer._id,
        message: `Don't miss ${newOffer.percentage}% off on all services in ${space.name} space`,
      });

      return res.status(200).json({
        offer: newOffer,
        notification: notification,
      });
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

    const { percentage, startDate, endDate } = req.body;

    // Validate percentage
    if (percentage && (percentage < 0.1 || percentage > 100)) {
      return res
        .status(400)
        .json({ error: "Percentage must be between 0.1 and 100" });
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      {
        percentage: percentage,
        startDate: startDate,
        endDate: endDate,
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
    const offers = await Offer.find()
      .sort({ createdAt: -1 })
      .populate("serviceId spaceId");
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

// Controller for getting all offers by spaceId
export const getAllOffersBySpace = async (req, res) => {
  const { spaceId } = req.body;
  try {
    const offers = await Offer.find({ spaceId: spaceId })
      .sort({
        createdAt: -1,
      })
      .populate("spaceId serviceId");
    return res.json(offers);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all valid offers by spaceId for today
export const getValidOffersBySpace = async (req, res) => {
  const { spaceId } = req.body;

  try {
    // Validate spaceId
    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all offers for the specified space that are valid for today
    const validOffers = await Offer.find({
      spaceId: spaceId,
      startDate: { $lte: today },
      endDate: { $gte: today },
    })
      .sort({ createdAt: -1 })
      .populate("serviceId spaceId");

    return res.json(validOffers);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};
