import express from "express";
import {
  addRating,
  editRating,
  deleteRating,
  getAllRatings,
  getOneRating,
  getRatingBySpace,
  getRatingByUser,
  getRatingsByManagerId,
} from "../controllers/ratingController.js";

const ratingRouter = express.Router();

// Route for adding a new rat ing
ratingRouter.post("/", addRating);

// Route for editing a rating
ratingRouter.patch("/", editRating);

// Route for deleting a rating
ratingRouter.delete("/", deleteRating);

// Route for getting all ratings
ratingRouter.get("/", getAllRatings);

// Route for getting one rating by ID
ratingRouter.post("/byId", getOneRating);

// Route for getting one rating by user
ratingRouter.post("/byUser", getRatingByUser);

// Route for getting one rating by space
ratingRouter.post("/bySpace", getRatingBySpace);

ratingRouter.post("/byUser_Space", getRatingsByManagerId);

export default ratingRouter;
