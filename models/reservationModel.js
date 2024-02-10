import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Room", "Desk"],
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    roomId: {
      type: mongoose.Types.ObjectId,
      ref: "Room",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
