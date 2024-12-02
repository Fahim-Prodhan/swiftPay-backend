// imports
import mongoose from "mongoose";

// Database Configurations
const connectDB = async () => {
  const DATABASE_URL = process.env.DB_URI;
  try {
    const DB_OPTIONS = {
      dbName: "MFS",
    };
    await mongoose.connect(DATABASE_URL, DB_OPTIONS);
    console.log("Database Connected Successfully...");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;