import mongoose from "mongoose";

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error(
      "CRITICAL: MONGO_URI is missing in production environment variables.",
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(`${mongoUri}/mern-auth`);
    console.log(`MongoDb connected : ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error Connecting to MongoDB: ${error.message}`);
  }
}

export default connectDB;
