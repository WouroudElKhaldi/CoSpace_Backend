import mongoose from "mongoose";

const { Schema } = mongoose;

const NotificationSchema = new Schema({
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
