import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log(`\n mongo connected ${connection.connection.host}`);
  } catch (error) {
    console.log("Mongo connection failed: ",error);
    process.exit(1);
  }
};
export default connectDB