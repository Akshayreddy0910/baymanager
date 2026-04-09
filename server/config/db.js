import mongoose from 'mongoose';

// Function to connect the application to the MongoDB database
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from environment variables
    await mongoose.connect(process.env.MONGO_URI);
    
    // Log success message if the connection is established
    console.log("MongoDB connected ✅");
  } catch (error) {
    // Log the error message if the connection fails
    console.log(error);
    
    // Exit the process with a failure code
    process.exit(1);
  }
};

// Export the connection function for use in the main server file
export default connectDB;
