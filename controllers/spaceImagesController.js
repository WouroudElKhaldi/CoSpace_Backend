import fs from "fs";
import mongoose from "mongoose";
import SpaceImages from "../models/spaceImagesModel.js";

// Controller for adding a new space image
export const addSpaceImage = async (req, res) => {
  try {
    const { spaceId } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Upload an image" });
    }

    const image = req.file.filename;

    const newSpaceImage = await SpaceImages.create({
      image: image,
      spaceId: spaceId,
    });

    if (!newSpaceImage) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(500).json({ error: "Failed to add space image" });
    }

    return res.status(200).json(newSpaceImage);
  } catch (error) {
    console.error(error);
    const imagePath = `public/images/${req.file.filename}`;
    fs.unlinkSync(imagePath);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for editing a space image
export const editSpaceImage = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid space image ID" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Upload an image" });
    }

    const image = req.file.filename;

    const imageToUpdate = await SpaceImages.findById(id);

    if (!imageToUpdate) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(500).json({ error: "Image not found" });
    }

    const imagePath = `public/images/${imageToUpdate.image}`;
    fs.unlinkSync(imagePath);

    const updatedSpaceImage = await SpaceImages.findByIdAndUpdate(
      id,
      { image: image },
      { new: true }
    );

    if (!updatedSpaceImage) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(500).json({ error: "Failed to update space image" });
    }

    return res.status(200).json(updatedSpaceImage);
  } catch (error) {
    console.error(error);
    const imagePath = `public/images/${req.file.filename}`;
    fs.unlinkSync(imagePath);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for deleting a space image
export const deleteSpaceImage = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid space image ID" });
    }

    const spaceImage = await SpaceImages.findById(id);

    const deletedSpaceImage = await SpaceImages.findByIdAndDelete(id);

    if (!deletedSpaceImage) {
      return res.status(404).json({ error: "Space image not found" });
    }

    const imagePath = `public/images/${spaceImage.image}`;
    fs.unlinkSync(imagePath);

    return res
      .status(200)
      .json({ message: "Space image deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting all space images
export const getAllSpaceImages = async (req, res) => {
  try {
    const spaceImages = await SpaceImages.find().sort({ createdAt: -1 });
    return res.json(spaceImages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting one space image by ID
export const getOneSpaceImage = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid space image ID" });
    }

    const spaceImage = await SpaceImages.findById(id);

    if (!spaceImage) {
      return res.status(404).json({ error: "Space image not found" });
    }

    return res.status(200).json(spaceImage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};
