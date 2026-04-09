import mongoose from 'mongoose';

// Schema for tracking specific garage work via Job Cards
const jobCardSchema = new mongoose.Schema(
  {
    // The booking this job card belongs to
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    // The staff member (mechanic) assigned to perform the work
    mechanicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // List of tasks to be performed by the mechanic
    tasks: [
      {
        description: { type: String, required: true },
        status: { type: String, default: 'Pending' },
      },
    ],
    // Overall status of the work on this job card
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed'],
      default: 'Open',
    },
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create the JobCard model and export it as the default module
const JobCard = mongoose.model('JobCard', jobCardSchema);
export default JobCard;
