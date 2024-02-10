import mongoose from "mongoose";
import Space from "./spaceModel.js";

const RoomSchema = new mongoose.Schema(
  {
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0.1,
    },
    deskPrice: {
      type: Number,
      required: true,
      min: 0.1,
    },
    deskNumber: {
      type: Number,
      required: true,
      min: 3,
    },
    reservedDeskNumber: {
      type: Number,
      default: 0,
    },
    reserveType: {
      type: String,
      required: true,
      enum: ["Room", "Desk"],
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model("Room", RoomSchema);

export default Room;
