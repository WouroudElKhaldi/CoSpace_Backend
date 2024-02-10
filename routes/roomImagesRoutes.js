import express from "express";
import upload from "../middlewares/multer.js";
import {
  addRoomImage,
  editRoomImage,
  deleteRoomImage,
  getAllRoomImages,
  getOneRoomImage,
} from "../controllers/roomImagesController.js";

const roomImageRouter = express.Router();

// Route for adding a new room image
roomImageRouter.post("/", upload.single("image"), addRoomImage);

// Route for editing a room image
roomImageRouter.patch("/", upload.single("image"), editRoomImage);

// Route for deleting a room image
roomImageRouter.delete("/", deleteRoomImage);

// Route for getting all room images
roomImageRouter.get("/", getAllRoomImages);

// Route for getting one room image by ID
roomImageRouter.get("/byId", getOneRoomImage);

export default roomImageRouter;
