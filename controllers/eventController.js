import mongoose from "mongoose";
import Event from "../models/eventsModel.js";

// Controller for adding a new event
export const addEvent = async (req, res) => {
  try {
    const { spaceId, title, startDate, endDate, description } = req.body;

    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    if (!spaceId || !title || !startDate || !endDate || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newEvent = await Event.create({
      spaceId,
      title,
      startDate,
      endDate,
      description,
    });

    return res.status(200).json(newEvent);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for editing an event
export const editEvent = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const { spaceId, title, startDate, endDate, description } = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        spaceId: spaceId,
        title: title,
        startDate: startDate,
        endDate: endDate,
        description: description,
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for deleting an event
export const deleteEvent = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ startDate: 1 })
      .populate("spaceId");
    return res.json(events);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all events
export const getEventBySpace = async (req, res) => {
  const { spaceId } = req.body;
  try {
    const events = await Event.find({ spaceId })
      .sort({ startDate: 1 })
      .populate("spaceId");
    return res.json(events);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting one event by ID
export const getOneEvent = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const event = await Event.findById(id).populate("spaceId");

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for searching events by title
export const searchEventsByName = async (req, res) => {
  try {
    const { title } = req.body;
    const regex = new RegExp(title, "i"); // Create case-insensitive regex pattern

    const events = await Event.find({ title: { $regex: regex } })
      .sort({ startDate: 1 })
      .populate("spaceId");

    return res.json(events);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for searching events between two specific dates
export const searchEventsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const events = await Event.find({
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    })
      .sort({ startDate: 1 })
      .populate("spaceId");

    return res.json(events);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for searching events by title, space name, and date range using aggregation
export const filterEvents = async (req, res) => {
  try {
    const { title, spaceName, startDate, endDate } = req.body;
    const pipeline = [];

    // Lookup stage to populate spaceId
    pipeline.push({
      $lookup: {
        from: "spaces", // Assuming your space collection is named "spaces"
        localField: "spaceId",
        foreignField: "_id",
        as: "space",
      },
    });

    // Match stage to filter events by title
    if (title) {
      pipeline.push({
        $match: { title: { $regex: new RegExp(title, "i") } },
      });
    }

    // Match stage to filter events by space name
    if (spaceName) {
      pipeline.push({
        $match: { "space.name": { $regex: new RegExp(spaceName, "i") } },
      });
    }

    // Filter stage to filter events by date range
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }
      pipeline.push({ $match: { startDate: dateFilter } });
    }

    // Execute aggregation pipeline
    const events = await Event.aggregate(pipeline);

    return res.json(events);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};
