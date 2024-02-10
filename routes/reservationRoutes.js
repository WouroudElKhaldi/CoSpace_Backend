import express from "express";
import {
  addReservation,
  editReservation,
  deleteReservation,
  getAllReservations,
  getOneReservation,
} from "../controllers/reservationController.js";

const reservationRouter = express.Router();

// Route for adding a new reservation
reservationRouter.post("/", addReservation);

// Route for editing a reservation
reservationRouter.put("/", editReservation);

// Route for deleting a reservation
reservationRouter.delete("/", deleteReservation);

// Route for getting all reservations
reservationRouter.get("/", getAllReservations);

// Route for getting one reservation by ID
reservationRouter.get("/byId", getOneReservation);

export default reservationRouter;
