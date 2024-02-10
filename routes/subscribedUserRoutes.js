import express from "express";
import {
  addSubscribedUser,
  deleteSubscribedUser,
  getAllSubscribedUsers,
  getOneSubscribedUser,
  getAllSubscribedUsersBySpaceId,
  getAllSpacesByUserId,
} from "../controllers/subscribedUserController.js";

const subscribedUserRouter = express.Router();

// Route for adding a new subscribed user
subscribedUserRouter.post("/", addSubscribedUser);

// Route for deleting a subscribed user
subscribedUserRouter.delete("/", deleteSubscribedUser);

// Route for getting all subscribed users
subscribedUserRouter.get("/", getAllSubscribedUsers);

// Route for getting one subscribed user by ID
subscribedUserRouter.post("/byId", getOneSubscribedUser);

// Route for getting all subscribed users by spaceId
subscribedUserRouter.post("/bySpace", getAllSubscribedUsersBySpaceId);

// Route for getting all spaces that a specific user is subscribed for
subscribedUserRouter.post("/byUser", getAllSpacesByUserId);

export default subscribedUserRouter;
