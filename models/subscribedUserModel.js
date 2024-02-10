import mongoose from "mongoose";

const SubUserSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

const SubscribedUser = mongoose.model("SubscribedUser", SubUserSchema);

export default SubscribedUser;
