import Amenities from "../models/amenitiesModel.js";
import mongoose from "mongoose";
import fs from "fs";

// Controller for adding a new amenity
export const addAmenity = async (req, res) => {
  const { name, category } = req.body;

  try {
    if (!name || !category) {
      return res.status(400).json({ error: "Name & category is required" });
    }

    if (!req.file) {
      return res.status(400).json({ erro: "Please upload an image" });
    }

    const image = req.file.filename;

    const newAmenity = await Amenities.create({
      name,
      image,
      category,
    });

    if (!newAmenity) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(400).jon({ error: "Amenity not added" });
    }

    return res.status(200).json(newAmenity);
  } catch (error) {
    console.error(error);
    const imagePath = `public/images/${req.file.filename}`;
    fs.unlinkSync(imagePath);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for editing an amenity
export const editAmenity = async (req, res) => {
  const id = req.body.id;
  const { name, category } = req.body;
  const image = req.file.filename;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid amenity ID" });
    }

    const updatedAmenity = await Amenities.findByIdAndUpdate(
      id,
      { name, image, category },
      { new: true }
    );

    if (req.file && !updatedAmenity) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(400).jon({ error: "Amenity not added" });
    }

    if (!updatedAmenity) {
      return res.status(404).json({ error: "Amenity not found" });
    }

    return res.status(200).json(updatedAmenity);
  } catch (error) {
    const imagePath = `public/images/${req.file.filename}`;
    fs.unlinkSync(imagePath);
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for deleting an amenity
export const deleteAmenity = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid amenity ID" });
    }

    const amenity = await Amenities.findOne({ _id: id });

    const imagePath = `public/images/${amenity.image}`;
    fs.unlinkSync(imagePath);

    const deletedAmenity = await Amenities.findByIdAndDelete(id);

    if (!deletedAmenity) {
      return res.status(404).json({ error: "Amenity not found" });
    }

    return res.status(200).json({ message: "Amenity deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting all amenities
export const getAllAmenities = async (req, res) => {
  try {
    const amenities = await Amenities.find().sort({ createdAt: 1 });
    return res.json(amenities);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting one amenity by ID
export const getOneAmenity = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid amenity ID" });
    }
    const amenity = await Amenities.findById(id);

    if (!amenity) {
      return res.status(404).json({ error: "Amenity not found" });
    }

    return res.status(200).json(amenity);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};
