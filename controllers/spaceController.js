import bcrypt from "bcrypt";
import fs from "fs";
import User from "../models/userModel.js";
import Space from "../models/spaceModel.js";
import Room from "../models/roomModel.js";
import mongoose from "mongoose";

export const addSpace = async (req, res) => {
  try {
    const { registered } = req.body;
    let newSpace;

    // return res.json(req.body);
    if (registered === "0") {
      // console.log("hello");
      const {
        name,
        email,
        password,
        firstName,
        lastName,
        cityId,
        address,
        longitude,
        latitude,
        description,
        categoryId,
        phoneNumber,
      } = req.body;

      // Check if all required fields are provided
      if (
        !name ||
        !email ||
        !password ||
        !firstName ||
        !lastName ||
        !cityId ||
        !address ||
        !longitude ||
        !latitude ||
        !description ||
        !categoryId ||
        !phoneNumber
      ) {
        return res.status(400).json("All fields are required");
      }

      // Check if image is uploaded
      if (!req.file) {
        return res.status(400).json({ error: "Upload an image" });
      }

      // Check if user with provided email already exists
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        const oldSpace = await Space.findOne({ name: name });

        if (oldSpace) {
          const imagePath = `public/images/${req.file?.filename}`;
          fs.unlinkSync(imagePath);
          return res.status(400).json({
            error: "This space already exist, please choose another name",
          });
        }

        if (existingUser && existingUser.role === "User") {
          // User exists, create space with 'Pending' status
          newSpace = await Space.create({
            status: "Pending",
            name: name,
            userId: existingUser._id,
            cityId: cityId,
            address: address,
            longitude: longitude,
            latitude: latitude,
            description: description,
            categoryId: categoryId,
          });
        } else if (existingUser && existingUser.role === "Manager") {
          // Manager exists, create space with 'Pending' status
          newSpace = await Space.create({
            status: "Accepted",
            name: name,
            userId: existingUser._id,
            cityId: cityId,
            address: address,
            longitude: longitude,
            latitude: latitude,
            description: description,
            categoryId: categoryId,
          });
        }

        return res.status(200).json(newSpace);
      }

      // User does not exist, create new user and space with 'Pending' status
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        role: "User",
        image: req.file.filename,
        phoneNumber: phoneNumber,
      });

      if (!newUser) {
        const imagePath = `public/images/${req.file?.filename}`;
        fs.unlinkSync(imagePath);
        return res.status(400).json("Error happened, user not created");
      }

      newSpace = await Space.create({
        status: "Pending",
        name: name,
        userId: newUser._id,
        cityId: cityId,
        address: address,
        longitude: longitude,
        latitude: latitude,
        description: description,
        categoryId: categoryId,
      });

      if (!newSpace) {
        const imagePath = `public/images/${req.file?.filename}`;
        fs.unlinkSync(imagePath);
        return res.status(400).json("Error happened, space not created");
      }

      return res.status(200).json(newSpace);
    } else if (registered === "1") {
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
        const imagePath = `public/images/${req.file?.filename}`;
        fs.unlinkSync(imagePath);
        return res.status(400).json("All fields are required");
      }

      // Check if user with provided email exists
      const user = await User.findOne({ email: email });

      if (!user) {
        const imagePath = `public/images/${req.file?.filename}`;
        fs.unlinkSync(imagePath);
        return res.status(404).json("User not found");
      }

      // Create space with appropriate status based on user role
      newSpace = await Space.create({
        status: user.role === "User" ? "Pending" : "Accepted",
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
    } else {
      const imagePath = `public/images/${req.file?.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(400).json("Invalid value for 'registered'");
    }
  } catch (error) {
    console.error(error);
    const imagePath = `public/images/${req.file.filename}`;
    fs.unlinkSync(imagePath);
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

      // Find all pending spaces for the user and update their status to Accepted
      const pendingSpaces = await Space.find({
        userId: updatedSpace.userId,
      });
      for (const space of pendingSpaces) {
        await Space.findByIdAndUpdate(space._id, { status: status });
      }

      return res.status(200).json({
        status: "Accepted",
        user: updatedUser,
        space: [updatedSpace, ...pendingSpaces],
      });
    }

    if (status === "Canceled") {
      updatedUser = await User.findByIdAndUpdate(
        updatedSpace.userId,
        { role: "User" },
        { new: true }
      );

      // Find all spaces for the user and update their status to Canceled
      const canceledSpaces = await Space.find({
        userId: updatedSpace.userId,
      });
      for (const space of canceledSpaces) {
        await Space.findByIdAndUpdate(space._id, { status: "Canceled" });
      }

      return res
        .status(200)
        .json({ status: "Canceled", user: updatedUser, space: canceledSpaces });
    }

    if (status === "Pending") {
      updatedUser = await User.findByIdAndUpdate(
        updatedSpace.userId,
        { role: "User" },
        { new: true }
      );

      // Find all spaces for the user and update their status to Canceled
      const pendingSpaces = await Space.find({
        userId: updatedSpace.userId,
      });
      for (const space of pendingSpaces) {
        await Space.findByIdAndUpdate(space._id, { status: "Pending" });
      }

      return res
        .status(200)
        .json({ status: "Canceled", user: updatedUser, space: pendingSpaces });
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

    // Find all rooms associated with the space
    const roomsToDelete = await Room.find({ spaceId: id });

    // Delete all rooms associated with the space
    for (const room of roomsToDelete) {
      await Room.findByIdAndDelete(room._id);
    }

    // Delete the space itself
    const deletedSpace = await Space.findByIdAndDelete(id);

    if (!deletedSpace) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res
      .status(200)
      .json({ message: "Space and associated rooms deleted successfully" });
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
      const spaces = await Space.find().sort({
        createdAt: -1,
      });
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
