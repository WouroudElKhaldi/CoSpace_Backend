import mongoose from "mongoose";

const RatignSchema = new mongoose.Schema(
  {
    spaceId: {
      type: mongoose.Types.ObjectId,
      ref: "Space",
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    spaceName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Rating = mongoose.model("Rating", RatignSchema);

export default Rating;
