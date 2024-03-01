import Rating from "../models/ratingModel.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Space from "../models/spaceModel.js";

// Controller for adding a new rating
export const addRating = async (req, res) => {
  const { spaceId, userId, rate, message } = req.body;

  try {
    if (!spaceId || !userId || !rate || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json("Invalid user ID");
    }

    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json("Invalid space ID");
    }

    const user = await User.findById(userId);
    const space = await Space.findById(spaceId);

    if (!user) {
      return res.status(400).json("User Not Found");
    }

    if (!space) {
      return res.status(400).json("Space Not Found");
    }

    const newRating = await Rating.create({
      spaceId,
      userId,
      rate,
      message,
      spaceName: space.name,
      userName: user.fullName,
    });

    return res.status(200).json(newRating);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for editing a rating
export const editRating = async (req, res) => {
  const id = req.body.id;
  const { rate, message } = req.body;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json("Invalid rating ID");
    }

    const updatedRating = await Rating.findByIdAndUpdate(
      id,
      { rate, message },
      { new: true }
    );

    if (!updatedRating) {
      return res.status(404).json("Rating not found");
    }

    return res.status(200).json(updatedRating);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for deleting a rating
export const deleteRating = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid rating ID" });
    }

    const deletedRating = await Rating.findByIdAndDelete(id);

    if (!deletedRating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    return res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting all   ratings
export const getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find()
      .sort({ createdAt: -1 })
      .populate("spaceId userId");
    return res.json(ratings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting all ratings
export const getRatingByUser = async (req, res) => {
  const { userId } = req.body;
  try {
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const ratings = await Rating.find({ userId: userId })
      .sort({
        createdAt: -1,
      })
      .populate("userId spaceId");
    return res.json(ratings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting all ratings
export const getRatingBySpace = async (req, res) => {
  const { spaceId } = req.body;
  try {
    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const ratings = await Rating.find({ spaceId: spaceId })
      .sort({
        createdAt: -1,
      })
      .populate("userId spaceId");
    return res.json(ratings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting one rating by ID
export const getOneRating = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid rating ID" });
    }
    const rating = await Rating.findById(id).populate("userId spaceId");

    if (!rating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    return res.status(200).json(rating);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

export const getRatingsByManagerId = async (req, res) => {
  const { userId } = req.body;

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json("User not found");
    }

    // Get all spaces for user
    const spaces = await Space.find({ users: userId });

    if (!spaces) {
      return res.status(404).json("No Spaces for this User");
    }
    // Get all ratings for spaces
    const ratings = await Rating.find({
      spaceId: { $in: spaces.map((space) => space._id) },
    });

    if (!ratings) {
      return res.status(404).json("No Ratings for any space for this User");
    }

    // Return ratings
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
