import express from "express";
import upload from "../middlewares/multer.js";
import {
  addAmenity,
  editAmenity,
  deleteAmenity,
  getAllAmenities,
  getOneAmenity,
} from "../controllers/amenitiesController.js";

const amenitiesRouter = express.Router();

// Route for adding a new amenity
amenitiesRouter.post("/", upload.single("image"), addAmenity);

// Route for editing an amenity
amenitiesRouter.patch("/", upload.single("image"), editAmenity);

// Route for deleting an amenity
amenitiesRouter.delete("/", deleteAmenity);

// Route for getting all amenities
amenitiesRouter.get("/", getAllAmenities);

// Route for getting one amenity by ID
amenitiesRouter.post("/byId", getOneAmenity);

export default amenitiesRouter;
