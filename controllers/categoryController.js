import Category from "../models/categoryModel.js";
import mongoose from "mongoose";
import fs from "fs";

// Controller for adding a new category
export const addCategory = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ erro: "Please upload an image" });
    }

    const image = req.file.filename;

    const newCategory = await Category.create({
      name,
      image,
    });

    if (!newCategory) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(400).jon({ error: "Amenity not added" });
    }

    return res.status(200).json(newCategory);
  } catch (error) {
    const imagePath = `public/images/${req.file.filename}`;
    fs.unlinkSync(imagePath);
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for editing a category
export const editCategory = async (req, res) => {
  const id = req.body.id;
  const { name } = req.body;

  if (req.file) {
    var image = req.file.filename;
  }

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, image },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for deleting a category
export const deleteCategory = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const category = await Category.findOne({ _id: id });

    if (!category) {
      return res.status(400).json({ error: "Category Not Found" });
    }
    const imagePath = `public/images/${category.image}`;
    fs.unlinkSync(imagePath);

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    return res.json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting one category by ID
export const getOneCategory = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};
