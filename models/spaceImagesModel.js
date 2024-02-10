import mongoose from "mongoose";

const SpaceImageSchema = new mongoose.Schema(
  {
    spaceId: {
      type: mongoose.Types.ObjectId,
      ref: "Space",
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

const SpaceImages = mongoose.model("SpaceImage", SpaceImageSchema);

export default SpaceImages;
