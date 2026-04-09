import mongoose from 'mongoose';

// Schema for tracking service bookings at the garage
const bookingSchema = new mongoose.Schema(
  {
    // The customer who is making the booking
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    // The specific vehicle registered for service
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    // The type of service requested (e.g., Oil Change)
    serviceType: {
      type: String,
      required: true,
    },
    // The scheduled date for the service appointment
    bookingDate: {
      type: Date,
      required: true,
    },
    // Current state of the booking in the workflow
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'In Progress', 'Completed'],
      default: 'Pending',
    },
  },
  {
    // Automatically track creation and modification times
    timestamps: true,
  }
);

// Create the Booking model and export it as the default module
const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
