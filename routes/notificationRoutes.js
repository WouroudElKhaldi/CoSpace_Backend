import express from "express";
import {
  addNotification,
  getAllNotifications,
  getOneNotification,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

// Route for adding a new notification
notificationRouter.post("/", addNotification);

// Route for getting all notifications
notificationRouter.get("/", getAllNotifications);

// Route for getting one notification by ID
notificationRouter.get("/byId", getOneNotification);

export default notificationRouter;
