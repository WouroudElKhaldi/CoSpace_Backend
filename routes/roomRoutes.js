import express from "express";
import {
  addRoom,
  editRoom,
  deleteRoom,
  getAllRooms,
  getRoomsBySpaceId,
  getOneRoom,
} from "../controllers/roomController.js";

const roomRouter = express.Router();

// Route for adding a new room
roomRouter.post("/", addRoom);

// Route for editing a room
roomRouter.patch("/", editRoom);

// Route for deleting a room
roomRouter.delete("/", deleteRoom);

// Route for getting all rooms
roomRouter.get("/", getAllRooms);

// Route for getting all rooms with the same spaceId
roomRouter.get("/bySpace", getRoomsBySpaceId);

// Route for getting one room by ID
roomRouter.post("/byId", getOneRoom);

export default roomRouter;
