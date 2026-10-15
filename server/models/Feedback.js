import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    jobCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      required: [true, "Job Card reference is required"],
      unique: true
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

feedbackSchema.index({ mechanicId: 1, createdAt: -1 });

feedbackSchema.index({ customerId: 1, createdAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
