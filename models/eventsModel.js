import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    spaceId: {
      type: mongoose.Types.ObjectId,
      ref: "Space",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", EventSchema);

export default Event;
