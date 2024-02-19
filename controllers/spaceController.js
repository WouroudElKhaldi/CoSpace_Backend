import Service from "../models/serviceModel.js";
import User from "../models/userModel.js";
import Space from "../models/spaceModel.js";
import Rating from "../models/ratingModel.js";
import mongoose from "mongoose";

export const addSpace = async (req, res) => {
  try {
    const {
      name,
      cityId,
      address,
      longitude,
      latitude,
      description,
      categoryId,
      email,
    } = req.body;

    // Check if all required fields are provided
    if (
      !name ||
      !cityId ||
      !address ||
      !longitude ||
      !latitude ||
      !description ||
      !categoryId
    ) {
      return res.status(400).json("All fields are required");
    }

    // Check if user with provided email exists
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json("User not found");
    }

    // Create space with appropriate status based on user role
    const newSpace = await Space.create({
      status: "Pending",
      name: name,
      cityId: cityId,
      address: address,
      longitude: longitude,
      latitude: latitude,
      description: description,
      categoryId: categoryId,
      userId: user._id,
    });

    return res.status(200).json(newSpace);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for accepting, canceling, or rejecting a space
export const SpaceStatus = async (req, res) => {
  const { status, id } = req.body;
  try {
    if (!["Pending", "Accepted", "Canceled"].includes(status)) {
      return res.status(401).json({
        error: "Invalid status, status options are Pending, Accepted, Canceled",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const updatedSpace = await Space.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!updatedSpace) {
      return res.status(404).json("Space not found");
    }

    let updatedUser;

    if (status === "Accepted") {
      updatedUser = await User.findByIdAndUpdate(
        updatedSpace.userId,
        { role: "Manager" },
        { new: true }
      );

      return res.status(200).json({
        status: "Accepted",
        user: updatedUser,
        space: updatedSpace,
      });
    }

    if (status === "Canceled") {
      updatedUser = await User.findByIdAndUpdate(
        updatedSpace.userId,
        { role: "User" },
        { new: true }
      );

      return res
        .status(200)
        .json({ status: "Canceled", user: updatedUser, space: updatedSpace });
    }

    if (status === "Pending") {
      updatedUser = await User.findByIdAndUpdate(
        updatedSpace.userId,
        { role: "User" },
        { new: true }
      );

      return res
        .status(200)
        .json({ status: "Pending", user: updatedUser, space: updatedSpace });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for editing a space
export const editSpace = async (req, res) => {
  try {
    const id = req.body.id;
    const { name, cityId, address, mapAddress, description } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const updatedSpace = await Space.findByIdAndUpdate(
      id,
      {
        name,
        cityId,
        address,
        mapAddress,
        description,
      },
      { new: true }
    );

    if (!updatedSpace) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res.status(200).json(updatedSpace);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for deleting a space
export const deleteSpace = async (req, res) => {
  try {
    const { id } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    // Find the space to be deleted
    const spaceToDelete = await Space.findById(id);
    if (!spaceToDelete) {
      return res.status(404).json({ error: "Space not found" });
    }

    // Find all services associated with the space
    const servicesToDelete = await Service.find({ spaceId: id });

    // Delete all services associated with the space
    for (const service of servicesToDelete) {
      await Service.findByIdAndDelete(service._id);
    }

    // Delete the space itself
    const deletedSpace = await Space.findByIdAndDelete(id);

    if (!deletedSpace) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res
      .status(200)
      .json({ message: "Space and associated services deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all spaces
export const getAllSpaces = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      const spaces = await Space.find()
        .sort({
          createdAt: -1,
        })
        .populate("amenities");
      return res.json(spaces);
    }
    const spaces = await Space.find({ status: status }).sort({
      createdAt: -1,
    });
    return res.json(spaces);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting one space by ID
export const getOneSpace = async (req, res) => {
  try {
    const { id } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const space = await Space.findById(id)
      .populate("cityId")
      .populate("categoryId")
      .populate("userId")
      .populate("amenities");

    if (!space) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res.status(200).json(space);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for adding amenities to a space
export const addAmenitiesToSpace = async (req, res) => {
  try {
    const { spaceId, amenities } = req.body;

    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const updatedSpace = await Space.findByIdAndUpdate(
      spaceId,
      { $addToSet: { amenities: { $each: amenities } } },
      { new: true }
    );

    if (!updatedSpace) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res.status(200).json(updatedSpace);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for deleting amenities from a space
export const deleteAmenitiesFromSpace = async (req, res) => {
  try {
    const { spaceId, amenities } = req.body;

    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const updatedSpace = await Space.findByIdAndUpdate(
      spaceId,
      { $pull: { amenities: { $in: amenities } } },
      { new: true }
    );

    if (!updatedSpace) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res.status(200).json(updatedSpace);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all spaces by userId
export const getSpacesByUserId = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const spaces = await Space.find({ userId: userId }).sort({ createdAt: -1 });

    if (!spaces || spaces.length === 0) {
      return res.status(404).json({ error: "No spaces found for this user" });
    }

    return res.status(200).json(spaces);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

export const getTopRatedSpaces = async (req, res) => {
  try {
    const ratings = await Rating.aggregate([
      {
        $group: {
          _id: "$spaceId",
          totalRating: { $sum: "$rate" },
          count: { $sum: 1 },
          ratings: { $push: "$$ROOT" },
        },
      },
      {
        $sort: { totalRating: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    const topSpaces = [];

    for (let i = 0; i < ratings.length; i++) {
      const space = await Space.findById(ratings[i]._id);
      topSpaces.push({
        space: space,
        totalRating: ratings[i].totalRating,
        count: ratings[i].count,
      });
    }

    res.status(200).json(topSpaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
