import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true, // Ensures uniqueness of usernames
    },
    pin: {
      type: String,
      required: true,
      minlength: 5,
    },
    role: {
      type: String,
      default: "user",
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures uniqueness of emails
    },
    isActive: {
      type: String,
      default: "pending",
    },
    profilePic: {
      type: String,
      default: "https://i.ibb.co/MkqW6tC/man.png",
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
