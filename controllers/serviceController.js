import fs from "fs";
import mongoose from "mongoose";
import Service from "../models/serviceModel.js";

// Controller for adding a new service
export const addService = async (req, res) => {
  try {
    const {
      spaceId,
      name,
      description,
      dailyPrice,
      monthlyPrice,
      annuallyPrice,
    } = req.body;

    if (!spaceId || !name || !description || !dailyPrice) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (
      isNaN(dailyPrice) ||
      (monthlyPrice && isNaN(monthlyPrice)) ||
      (annuallyPrice && isNaN(annuallyPrice))
    ) {
      return res.status(400).json({ error: "Prices should be numbers" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Upload an image" });
    }

    const image = req.file.filename;

    const newService = await Service.create({
      spaceId,
      name,
      description,
      dailyPrice,
      monthlyPrice,
      annuallyPrice,
      image,
    });

    if (!newService) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(500).json({ error: "Failed to add service" });
    }

    return res.status(200).json(newService);
  } catch (error) {
    console.error(error);
    const imagePath = `public/images/${req.file.filename}`;
    fs.unlinkSync(imagePath);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for editing a service
export const editService = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid service ID" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Upload an image" });
    }

    const image = req.file.filename;

    const serviceToUpdate = await Service.findById(id);

    if (!serviceToUpdate) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(500).json({ error: "Service not found" });
    }

    const imagePath = `public/images/${serviceToUpdate.image}`;
    fs.unlinkSync(imagePath);

    const updatedService = await Service.findByIdAndUpdate(
      id,
      { image, ...req.body },
      { new: true }
    );

    if (!updatedService) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(500).json({ error: "Failed to update service" });
    }

    return res.status(200).json(updatedService);
  } catch (error) {
    console.error(error);
    const imagePath = `public/images/${req.file.filename}`;
    fs.unlinkSync(imagePath);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for deleting a service
export const deleteService = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid service ID" });
    }

    const service = await Service.findById(id);

    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    const imagePath = `public/images/${service.image}`;
    fs.unlinkSync(imagePath);

    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting all services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .sort({ createdAt: -1 })
      .populate("spaceId");
    return res.json(services);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting one service by ID
export const getOneService = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid service ID" });
    }

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    return res.status(200).json(service);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting services by SpaceId
export const getServicesBySpaceId = async (req, res) => {
  const spaceId = req.body.spaceId;

  try {
    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const services = await Service.find({ spaceId });

    if (!services.length) {
      return res
        .status(404)
        .json({ error: "No services found for this space" });
    }

    return res.status(200).json(services);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};
