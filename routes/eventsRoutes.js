import express from "express";
import {
  addEvent,
  editEvent,
  deleteEvent,
  getAllEvents,
  getOneEvent,
  getEventBySpace,
  searchEventsByName,
  searchEventsByDateRange,
  filterEvents,
  getEventsByUserId,
} from "../controllers/eventController.js";

const eventRouter = express.Router();

// Route for adding a new event
eventRouter.post("/", addEvent);

// Route for editing an event
eventRouter.patch("/", editEvent);

// Route for deleting an event
eventRouter.delete("/", deleteEvent);

// Route for getting all events
eventRouter.get("/", getAllEvents);

// Route for getting one event by ID
eventRouter.post("/byId", getOneEvent);

// Route for getting one event by space
eventRouter.post("/bySpace", getEventBySpace);

// Route for getting one event by name
eventRouter.post("/byName", searchEventsByName);

// Route for getting one event by date
eventRouter.post("/byDate", searchEventsByDateRange);

// Route for filter event
eventRouter.post("/filter", filterEvents);

eventRouter.post("/byUser", getEventsByUserId);

export default eventRouter;
