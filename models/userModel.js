import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "User", "Manager"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    phoneNumber: { type: Number },
    image: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Verified"],
    },
    verificationCode: {
      type: String,
      required: true,
      minlength: 6,
    },
    deleteCode: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
