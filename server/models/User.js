import mongoose from 'mongoose';

// Definition of the User Schema for the database
const userSchema = new mongoose.Schema(
  {
    // The full name of the user
    name: {
      type: String,
      required: true,
    },
    // The unique email address for logging in
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // The hashed password for security
    password: {
      type: String,
      required: true,
    },
    // The role determines what the user can do in the system
    role: {
      type: String,
      enum: ['admin', 'staff', 'customer'],
      default: 'customer',
    },
  },
  {
    // Automatically manage createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create the model based on the schema and export it
const User = mongoose.model('User', userSchema);
export default User;
