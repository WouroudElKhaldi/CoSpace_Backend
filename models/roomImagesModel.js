import mongoose from "mongoose";

const RoomImageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const RoomImages = mongoose.model("RoomImages", RoomImageSchema);

export default RoomImages;
