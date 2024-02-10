import mongoose from "mongoose";

const SpaceSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Accepted", "Canceled"],
    },
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: Number,
      default: 0,
    },
    reservedRoomNumber: {
      type: Number,
      default: 0,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Amenity",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Space = mongoose.model("Space", SpaceSchema);

export default Space;
