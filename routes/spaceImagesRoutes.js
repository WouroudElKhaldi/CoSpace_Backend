import express from "express";
import upload from "../middlewares/multer.js";
import {
  addSpaceImage,
  editSpaceImage,
  deleteSpaceImage,
  getAllSpaceImages,
  getOneSpaceImage,
} from "../controllers/spaceImagesController.js";

const spaceImageRouter = express.Router();

// Route for adding a new space image
spaceImageRouter.post("/", upload.single("image"), addSpaceImage);

// Route for editing a space image
spaceImageRouter.patch("/", upload.single("image"), editSpaceImage);

// Route for deleting a space image
spaceImageRouter.delete("/", deleteSpaceImage);

// Route for getting all space images
spaceImageRouter.post("/bySpace", getAllSpaceImages);

// Route for getting one space image by ID
spaceImageRouter.post("/byId", getOneSpaceImage);

export default spaceImageRouter;
