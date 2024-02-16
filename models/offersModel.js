import mongoose from "mongoose";

const OfferSchema = new mongoose.Schema(
  {
    percentage: {
      type: Number,
      min: 0.1,
      max: 100,
      required: true,
      validate: {
        validator: function (value) {
          return value > 0 && value < 100;
        },
        message: (props) =>
          `${props.value} is not a valid percentage. It should be greater than 0 and less than 100.`,
      },
    },
    type: {
      type: String,
      enum: ["spaceOffer", "serviceOffer"],
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
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: function () {
        return this.type === "serviceOffer";
      },
    },
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model("Offer", OfferSchema);

export default Offer;
