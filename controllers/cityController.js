import City from "../models/cityModel.js";
import mongoose from "mongoose";

// Controller for adding a new city
export const addCity = async (req, res) => {
  const { city } = req.body;

  try {
    if (!city) {
      return res.status(400).json({ error: "City name is required" });
    }

    const newCity = await City.create({
      city,
    });

    return res.status(200).json(newCity);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for editing a city
export const editCity = async (req, res) => {
  const id = req.body.id;
  const { city } = req.body;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid city ID" });
    }

    const updatedCity = await City.findByIdAndUpdate(
      id,
      { city },
      { new: true }
    );

    if (!updatedCity) {
      return res.status(404).json({ error: "City not found" });
    }

    return res.status(200).json(updatedCity);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for deleting a city
export const deleteCity = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid city ID" });
    }

    const deletedCity = await City.findByIdAndDelete(id);

    if (!deletedCity) {
      return res.status(404).json({ error: "City not found" });
    }

    return res.status(200).json({ message: "City deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting all cities
export const getAllCities = async (req, res) => {
  try {
    const cities = await City.find();
    return res.json(cities);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting one city by ID
export const getOneCity = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid city ID" });
    }
    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    return res.status(200).json(city);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};
