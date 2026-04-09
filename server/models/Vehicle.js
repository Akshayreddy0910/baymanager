import mongoose from 'mongoose';

// Definition of the Vehicle Schema for storing vehicle details
const vehicleSchema = new mongoose.Schema(
  {
    // Reference to the customer who owns the vehicle
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    // Unique registration number (license plate) of the vehicle
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    // The model/make of the vehicle (e.g., Toyota Corolla)
    model: {
      type: String,
      required: true,
    },
    // The manufacturing year of the vehicle
    year: {
      type: Number,
      required: true,
    },
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create the Vehicle model and export it as the default module
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
