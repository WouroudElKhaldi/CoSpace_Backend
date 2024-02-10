import Reservation from "../models/reservationModel.js";
import mongoose from "mongoose";

// controller to add a reservation
export const addReservation = async (req, res) => {
  const { type, roomId, price, quantity } = req.body;

  if (!["Room", "Desk"].includes(type)) {
    return res.status(400).json("Invalid reservation type");
  }

  if (!mongoose.isValidObjectId(roomId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  if (type === "Room") {
    const reservation = await Reservation.create({
      type: type,
      price: price,
      roomId: roomId,
    });

    if (!reservation) {
      return res.status(400).json("Reservation not completed");
    }

    return res.status(200).json(reservation);
  }

  if (type === "Desk") {
    const totalPrice = price * quantity;
    const reservation = await Reservation.create({
      type: type,
      quantity: quantity,
      roomId: roomId,
      price: totalPrice,
    });

    return res.status(200).json(reservation);
  }
};

// Controller for editing a reservation
export const editReservation = async (req, res) => {
  const { id, updates } = req.body;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid reservation ID" });
    }

    const reservation = await Reservation.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    return res.status(200).json(reservation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for deleting a reservation
export const deleteReservation = async (req, res) => {
  const { id } = req.body;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid reservation ID" });
    }

    const reservation = await Reservation.findByIdAndDelete(id);

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    return res
      .status(200)
      .json({ message: "Reservation deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting all reservations
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    return res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting one reservation by ID
export const getOneReservation = async (req, res) => {
  const { id } = req.body;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid reservation ID" });
    }

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    return res.status(200).json(reservation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};
