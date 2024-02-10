import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";
import Offer from "../models/offersModel.js";

// Controller for adding a new notification
export const addNotification = async (req, res) => {
  try {
    const { offerId } = req.body;

    // Validate offerId
    if (!mongoose.isValidObjectId(offerId)) {
      return res.status(400).json({ error: "Invalid offer ID" });
    }

    // Find the offer and populate related fields
    const offer = await Offer.findById(offerId).populate("spaceId roomId");

    // Check if offer is found
    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }

    let message;
    if (offer.type === "roomOffer") {
      message = `Co-working space: ${offer.spaceId.name} has a new offer on room number: ${offer.roomId.number} of ${offer.percentage}`;
    } else if (offer.type === "spaceOffer") {
      message = `Co-working space: ${offer.spaceId.name} has a new offer on the space of ${offer.percentage}`;
    } else {
      return res.status(400).json({ error: "Invalid offer type" });
    }

    // Create the notification with the generated message
    const newNotification = await Notification.create({ offerId, message });

    return res.status(200).json(newNotification);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all notifications
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate("offerId");
    return res.json(notifications);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting one notification by ID
export const getOneNotification = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const notification = await Notification.findById(id).populate("offerId");

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};
