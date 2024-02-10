import fs from "fs";
import mongoose from "mongoose";
import Rule from "../models/rulesModel.js";

// Controller for adding a new Rule
export const addRule = async (req, res) => {
  const { name, spaceId } = req.body;
  try {
    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json({ error: "Invalid Space ID" });
    }

    if (!name || !spaceId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Upload an image" });
    }

    const image = req.file ? req.file.filename : null;

    const newRule = await Rule.create({
      name,
      image,
      spaceId,
    });

    if (!newRule) {
      if (image) {
        // If an image was uploaded but failed to create the rule, delete the image
        const imagePath = `public/images/${req.file.filename}`;
        fs.unlinkSync(imagePath);
      }
      return res.status(500).json({ error: "Failed to add rule" });
    }

    return res.status(200).json(newRule);
  } catch (error) {
    console.error(error);
    if (req.file) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
    }
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for editing a Rule
export const editRule = async (req, res) => {
  const id = req.body.id;
  const { name } = req.body;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid Rule ID" });
    }

    const ruleToUpdate = await Rule.findById(id);

    // Check if there's an uploaded file
    if (req.file) {
      var image = req.file.filename;
      const imagePath = `public/images/${ruleToUpdate.image}`;
      fs.unlinkSync(imagePath);
    }

    const updatedRule = await Rule.findByIdAndUpdate(
      id,
      {
        name: name,
        image: image,
      },
      {
        new: true,
      }
    );

    if (!updatedRule) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(404).json({ error: "Rule not found" });
    }

    return res.status(200).json(updatedRule);
  } catch (error) {
    console.error(error);
    if (req.file) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
    }
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for deleting a Rule
export const deleteRule = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid Rule ID" });
    }

    const deletedRule = await Rule.findByIdAndDelete(id);

    if (!deletedRule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    // Remove associated image if it exists
    if (deletedRule.image) {
      const imagePath = `public/images/${deletedRule.image}`;
      fs.unlinkSync(imagePath);
    }

    return res.status(200).json({ message: "Rule deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting all Rules
export const getAllRules = async (req, res) => {
  try {
    const rules = await Rule.find().sort({ createdAt: -1 });
    return res.json(rules);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting one Rule by ID
export const getOneRule = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid Rule ID" });
    }
    const rule = await Rule.findById(id);

    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    return res.status(200).json(rule);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};
