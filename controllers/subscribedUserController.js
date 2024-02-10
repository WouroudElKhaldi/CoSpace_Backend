import mongoose from "mongoose";
import SubscribedUser from "../models/subscribedUserModel.js";
import User from "../models/userModel.js";
import Space from "../models/spaceModel.js";

// Controller for adding a new subscribed user
export const addSubscribedUser = async (req, res) => {
  try {
    const { spaceId, userId } = req.body;

    // Validate spaceId and userId
    if (
      !mongoose.isValidObjectId(spaceId) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return res.status(400).json({ error: "Invalid space ID or user ID" });
    }

    const user = await User.findById(userId);
    const space = await Space.findById(spaceId);

    if (!user) {
      return res.status(400).json({ error: "User Not Found" });
    }

    if (!space) {
      return res.status(400).json({ error: "Space Not Found" });
    }

    const existing = await SubscribedUser.findOne({ spaceId, userId });

    if (existing) {
      return res.status(400).json({ error: "This user is already subscribed" });
    }

    const subscribedUser = await SubscribedUser.create({ spaceId, userId });

    return res.status(200).json(subscribedUser);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for deleting a subscribed user
export const deleteSubscribedUser = async (req, res) => {
  try {
    const { id } = req.body;

    // Validate subscribed user ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid subscribed user ID" });
    }

    const deletedSubscribedUser = await SubscribedUser.findByIdAndDelete(id);

    if (!deletedSubscribedUser) {
      return res.status(404).json({ error: "Subscribed user not found" });
    }

    return res
      .status(200)
      .json({ message: "Subscribed user deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all subscribed users
export const getAllSubscribedUsers = async (req, res) => {
  try {
    const subscribedUsers = await SubscribedUser.find()
      .sort({ createdAt: -1 })
      .populate("userId spaceId");
    return res.json(subscribedUsers);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting one subscribed user by ID
export const getOneSubscribedUser = async (req, res) => {
  try {
    const { id } = req.body;

    // Validate subscribed user ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid subscribed user ID" });
    }

    const subscribedUser = await SubscribedUser.findById(id).populate(
      "userId spaceId"
    );

    if (!subscribedUser) {
      return res.status(404).json({ error: "Subscribed user not found" });
    }

    return res.status(200).json(subscribedUser);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all subscribed users by spaceId
export const getAllSubscribedUsersBySpaceId = async (req, res) => {
  try {
    const { spaceId } = req.body;

    // Validate spaceId
    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const subscribedUsers = await SubscribedUser.find({ spaceId }).populate(
      "userId spaceId"
    );

    return res.json(subscribedUsers);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all spaces that a specific user is subscribed for
export const getAllSpacesByUserId = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate userId
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const subscribedSpaces = await SubscribedUser.find({ userId }).populate(
      "userId spaceId"
    );

    return res.json(subscribedSpaces);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};
