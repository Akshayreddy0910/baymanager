import mongoose from "mongoose";

/**
 * Feedback Schema
 * Why jobCardId is unique: To ensure that a customer can only submit one review per specific job.
 * Why we store mechanicId as a snapshot: To keep a permanent record of who performed the work at the time of the review, 
 * even if that mechanic later leaves or changes roles in the 'users' collection.
 * Why we have two separate ratings: Because a customer might love the mechanic's skill but hate the garage's wait times (or vice versa). 
 * This provides clearer operational signals for business management.
 */
const feedbackSchema = new mongoose.Schema(
  {
    jobCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      required: [true, "Job Card reference is required"],
      unique: true // Prevents multiple feedback submissions for the same job completion
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer reference is required"]
    },
    mechanicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Mechanic reference is required"]
    },
    garageRating: {
      type: Number,
      required: [true, "Garage rating is required"],
      min: 1,
      max: 5
    },
    mechanicRating: {
      type: Number,
      required: [true, "Mechanic rating is required"],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },
    wouldRecommend: {
      type: Boolean,
      required: [true, "Recommendation status is required"],
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Optimize lookups for mechanic profile reviews (latest first)
feedbackSchema.index({ mechanicId: 1, createdAt: -1 });

// Optimize lookups for customer's "My History" feedback list
feedbackSchema.index({ customerId: 1, createdAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
