import mongoose from "mongoose";
import Space from "./spaceModel.js";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dailyPrice: {
      type: Number,
      required: true,
      min: 0.1,
    },
    monthlyPrice: {
      type: Number,
      min: 0.1,
    },
    annuallyPrice: {
      type: Number,
      min: 0.1,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
