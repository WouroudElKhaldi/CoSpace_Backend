import express from "express";
import {
  addService,
  editService,
  deleteService,
  getAllServices,
  getOneService,
  getServicesBySpaceId,
} from "../controllers/serviceController.js";
import upload from "../middlewares/multer.js";

const serviceRouter = express.Router();

// Route for adding a new room
serviceRouter.post("/", upload.single("image"), addService);

// Route for editing a room
serviceRouter.patch("/", upload.single("image"), editService);

// Route for deleting a room
serviceRouter.delete("/", deleteService);

// Route for getting all rooms
serviceRouter.get("/", getAllServices);

// Route for getting all rooms with the same spaceId
serviceRouter.post("/bySpace", getServicesBySpaceId);

// Route for getting one room by ID
serviceRouter.post("/byId", getOneService);

// Route for filter room by desk price or price
serviceRouter.post("/filter");

export default serviceRouter;
