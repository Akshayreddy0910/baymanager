import mongoose from 'mongoose';

const jobCardSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    mechanicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tasks: [
      {
        description: { type: String, required: true },
        status: { type: String, default: 'Pending' },
      },
    ],
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed'],
      default: 'Open',
    },
  },
  {
    timestamps: true,
  }
);

const JobCard = mongoose.model('JobCard', jobCardSchema);
export default JobCard;
