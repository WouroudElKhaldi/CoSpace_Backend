import fs from "fs";
import mongoose from "mongoose";
import RoomImages from "../models/roomImagesModel.js";

// Controller for adding a new room image
export const addRoomImage = async (req, res) => {
  try {
    const { roomId } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Upload an image" });
    }

    const image = req.file.filename;

    const newRoomImage = await RoomImages.create({
      image: image,
      roomId: roomId,
    });

    if (!newRoomImage) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(500).json({ error: "Failed to add room image" });
    }

    return res.status(200).json(newRoomImage);
  } catch (error) {
    console.error(error);
    const imagePath = `public/images/${req.file.filename}`;
    fs.unlinkSync(imagePath);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for editing a room image
export const editRoomImage = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid room image ID" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Upload an image" });
    }

    const image = req.file.filename;

    const imageToUpdate = await RoomImages.findById(id);

    if (!imageToUpdate) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(500).json({ error: "Image not found" });
    }

    const imagePath = `public/images/${imageToUpdate.image}`;
    fs.unlinkSync(imagePath);

    const updatedRoomImage = await RoomImages.findByIdAndUpdate(
      id,
      { image: image },
      { new: true }
    );

    if (!updatedRoomImage) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(500).json({ error: "Failed to update room image" });
    }

    return res.status(200).json(updatedRoomImage);
  } catch (error) {
    console.error(error);
    const imagePath = `public/images/${req.file.filename}`;
    fs.unlinkSync(imagePath);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for deleting a room image
export const deleteRoomImage = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid room image ID" });
    }

    const roomImage = await RoomImages.findById(id);

    const deletedRoomImage = await RoomImages.findByIdAndDelete(id);

    if (!deletedRoomImage) {
      return res.status(404).json({ error: "Room image not found" });
    }

    const imagePath = `public/images/${roomImage.image}`;
    fs.unlinkSync(imagePath);

    return res.status(200).json({ message: "Room image deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting all room images
export const getAllRoomImages = async (req, res) => {
  try {
    const roomImages = await RoomImages.find().sort({ createdAt: -1 });
    return res.json(roomImages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting one room image by ID
export const getOneRoomImage = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid room image ID" });
    }

    const roomImage = await RoomImages.findById(id);

    if (!roomImage) {
      return res.status(404).json({ error: "Room image not found" });
    }

    return res.status(200).json(roomImage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};
