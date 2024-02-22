import express from "express";
import {
  addSpace,
  SpaceStatus,
  editSpace,
  deleteSpace,
  getAllSpaces,
  getOneSpace,
  addAmenitiesToSpace,
  deleteAmenitiesFromSpace,
  getSpacesByUserId,
  getTopRatedSpaces,
  filterSpaces,
} from "../controllers/spaceController.js";
import upload from "../middlewares/multer.js";

const spaceRouter = express.Router();

// Route for adding a new space
spaceRouter.post("/add", upload.single("image"), addSpace);

// Route for changing the status of a space (accepting or rejecting)
spaceRouter.patch("/status", SpaceStatus);

// Route for editing a space
spaceRouter.patch("/", editSpace);

// Route for deleting a space
spaceRouter.delete("/", deleteSpace);

// Route for getting all spaces
spaceRouter.post("/", getAllSpaces);

// Route for getting one space by ID
spaceRouter.post("/byId", getOneSpace);

// Route for getting otop 5 rated spaces
spaceRouter.get("/byRate", getTopRatedSpaces);

// Route for getting one space by user ID
spaceRouter.post("/userId", getSpacesByUserId);

// Route for adding amenities to a space
spaceRouter.post("/addAmenity", addAmenitiesToSpace);

// Route for deleting amenities from a space
spaceRouter.post("/deleteAmenity", deleteAmenitiesFromSpace);

spaceRouter.post("/filter", filterSpaces);

export default spaceRouter;
