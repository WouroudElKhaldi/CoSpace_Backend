import mongoose from "mongoose";
import Room from "../models/roomModel.js";
import Space from "../models/spaceModel.js";

// Controller for adding a new room
export const addRoom = async (req, res) => {
  try {
    const { spaceId, description, deskNumber, price, deskPrice, reserveType } =
      req.body;

    if (
      !spaceId ||
      !description ||
      !deskNumber ||
      !price ||
      !deskPrice ||
      !reserveType
    ) {
      return res.status(400).json("All fields are required");
    }

    // Validate spaceId
    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    // Validate deskNumber
    if (deskNumber < 3) {
      return res.status(400).json({ error: "Desk number must be at least 3" });
    }

    // Validate price and deskPrice
    if (price < 0.1 || deskPrice < 0.1) {
      return res
        .status(400)
        .json({ error: "Price and desk price must be at least 0.1" });
    }

    const room = await Room.create({
      spaceId,
      description,
      deskNumber,
      price,
      deskPrice,
      reserveType,
    });

    // Increment roomNumber in the corresponding space
    await Space.findByIdAndUpdate(spaceId, { $inc: { roomNumber: 1 } });

    return res.status(200).json(room);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for editing a room
export const editRoom = async (req, res) => {
  try {
    const { id, description, deskNumber, price, deskPrice } = req.body;

    // Validate room ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid room ID" });
    }

    // Validate deskNumber
    if (deskNumber < 3) {
      return res.status(400).json({ error: "Desk number must be at least 3" });
    }

    // Validate price and deskPrice
    if (price < 0.1 || deskPrice < 0.1) {
      return res
        .status(400)
        .json({ error: "Price and desk price must be at least 0.1" });
    }

    // Find the room by ID and update its fields
    const room = await Room.findByIdAndUpdate(
      id,
      {
        description,
        deskNumber,
        price,
        deskPrice,
      },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    return res.status(200).json(room);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for deleting a room
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.body;

    // Validate room ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid room ID" });
    }

    // Find the room by ID and delete it
    const room = await Room.findByIdAndDelete(id);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Decrement roomNumber in the corresponding space
    await Space.findByIdAndUpdate(room.spaceId, { $inc: { roomNumber: -1 } });

    return res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    return res.json(rooms);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all rooms with the same spaceId
export const getRoomsBySpaceId = async (req, res) => {
  try {
    const { spaceId } = req.body;

    // Validate space ID
    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    // Find all rooms with the given space ID
    const rooms = await Room.find({ spaceId }).sort({ createdAt: -1 });
    return res.json(rooms);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting one room by ID
export const getOneRoom = async (req, res) => {
  try {
    const { id } = req.body;

    // Validate room ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid room ID" });
    }

    // Find the room by ID
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    return res.status(200).json(room);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};
