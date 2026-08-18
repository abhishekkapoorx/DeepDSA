import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;
let isConnected = false;

export async function connectToDB() {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not defined in environment variables");
    return;
  }

  console.log(MONGO_URI.slice(0, 5) + "..." + MONGO_URI.slice(-15)); // Log first and last 20 characters of the URI for debugging

  if (isConnected) {
    console.log("ℹ️ MongoDB is already connected, skipping reconnection");
    return;
  }

  try {
    console.log("⏳ Attempting to connect to MongoDB...");

    const connection = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    isConnected = connection.connection.readyState === 1;

    if (isConnected) {
      console.log("✅ MongoDB connected successfully");
    } else {
      console.warn("⚠️ MongoDB connection established but not ready");
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error; // rethrow so your app knows connection failed
  }
}

export default connectToDB;