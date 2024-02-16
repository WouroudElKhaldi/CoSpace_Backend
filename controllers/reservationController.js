import Reservation from "../models/reservationModel.js";
import mongoose from "mongoose";
import Service from "../models/serviceModel.js";

// controller to add a reservation
export const addReservation = async (req, res) => {
  const { type, serviceId, date, userId } = req.body;

  try {
    if (!["Daily", "Monthly", "Annualy"].includes(type)) {
      return res.status(400).json("Invalid reservation type");
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (!mongoose.isValidObjectId(serviceId)) {
      return res.status(400).json({ error: "Invalid service ID" });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(400).json({ error: "Service not found" });
    }

    const price =
      type === "Daily"
        ? service.dailyPrice
        : type === "Monthly"
        ? service.monthlyPrice
        : type === "Annualy"
        ? service.annuallyPrice
        : "";

    const reservation = await Reservation.create({
      userId: userId,
      type: type,
      price: price,
      serviceId: serviceId,
      date: date,
    });

    if (!reservation) {
      return res.status(400).json("Reservation not completed");
    }

    return res.status(200).json(reservation);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Controller for editing a reservation
export const editReservation = async (req, res) => {
  const { id, type, date } = req.body;

  if (!["Daily", "Monthly", "Annualy"].includes(type)) {
    return res.status(400).json("Invalid reservation type");
  }

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid reservation ID" });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      {
        type: type,
        date: date,
      },
      {
        new: true,
      }
    );

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

// Controller for getting all reservations by space
export const getAllReservationsBySpace = async (req, res) => {
  const { spaceId } = req.body;
  try {
    const reservations = await Reservation.find({ spaceId }).sort({
      createdAt: -1,
    });
    return res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};
