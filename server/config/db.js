import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error(`👉 Make sure MongoDB service is running on ${process.env.MONGODB_URI || 'mongodb://localhost:27017'}`);
  }
};

export default connectDB;
