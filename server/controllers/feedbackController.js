import Feedback from "../models/Feedback.js";
import JobCard from "../models/JobCard.js";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";
import mongoose from "mongoose";

export const submitFeedback = async (req, res) => {
  try {
    const { jobCardId, garageRating, mechanicRating, comment, wouldRecommend } = req.body;

    const required = ["jobCardId", "garageRating", "mechanicRating"];
    const missing = [];
    for (let i = 0; i < required.length; i++) {
        if (!req.body[required[i]]) {
            missing.push(required[i]);
        }
    }
    if (missing.length > 0) {
        return res.status(400).json({ message: "Missing required fields", missing });
    }

    if (garageRating < 1 || garageRating > 5 || mechanicRating < 1 || mechanicRating > 5) {
        return res.status(400).json({ message: "Ratings must be integers between 1 and 5" });
    }

    const jobCard = await JobCard.findById(jobCardId);
    if (!jobCard) {
        return res.status(404).json({ message: "Job card not found" });
    }
    if (jobCard.status !== "Completed") {
        return res.status(400).json({ message: "Feedback can only be submitted for completed jobs" });
    }

    const booking = await Booking.findById(jobCard.bookingId);
    if (!booking) {
        return res.status(404).json({ message: "Associated booking not found" });
    }

    const customerProfile = await Customer.findOne({ 
        email: { $regex: new RegExp("^" + req.user.email + "$", "i") } 
    });
    
    if (!customerProfile || booking.customerId.toString() !== customerProfile._id.toString()) {
        return res.status(403).json({ message: "You cannot submit feedback for a job that doesn't belong to you" });
    }

    const existing = await Feedback.findOne({ jobCardId });
    if (existing) {
        return res.status(400).json({ message: "You have already submitted feedback for this job" });
    }

    const feedback = new Feedback({
      jobCardId,
      customerId: customerProfile._id,
      mechanicId: jobCard.mechanicId,
      garageRating,
      mechanicRating,
      comment,
      wouldRecommend
    });

    const savedFeedback = await feedback.save();
    res.status(201).json({ 
        message: "Feedback submitted successfully", 
        feedback: savedFeedback 
    });

  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback", error: error.message });
  }
};

export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .populate("customerId", "name email phone")
      .populate("mechanicId", "name email")
      .populate({
        path: "jobCardId",
        populate: { path: "bookingId", select: "serviceType bookingDate" }
      });

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all feedback", error: error.message });
  }
};

export const getMyFeedback = async (req, res) => {
  try {
    const customerProfile = await Customer.findOne({ 
        email: { $regex: new RegExp("^" + req.user.email + "$", "i") } 
    });
    if (!customerProfile) {
        return res.status(404).json({ message: "Customer profile not found" });
    }

    const feedbacks = await Feedback.find({ customerId: customerProfile._id })
      .sort({ createdAt: -1 })
      .populate("mechanicId", "name")
      .populate({
        path: "jobCardId",
        populate: { path: "bookingId", select: "serviceType" }
      });

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your feedback", error: error.message });
  }
};

export const getMechanicFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ mechanicId: req.user.id || req.user._id })
      .sort({ createdAt: -1 })
      .populate("customerId", "name")
      .populate({
        path: "jobCardId",
        populate: { path: "bookingId", select: "serviceType" }
      });

    let totalReviews = feedbacks.length;
    let sumRating = 0;
    for (let i = 0; i < feedbacks.length; i++) {
        sumRating += feedbacks[i].mechanicRating;
    }
    
    const averageRating = totalReviews > 0 ? (sumRating / totalReviews).toFixed(1) : 0;

    res.status(200).json({
      summary: {
        totalReviews,
        averageRating: Number(averageRating)
      },
      feedbacks
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching mechanic feedback", error: error.message });
  }
};

export const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalFeedbacks: { $sum: 1 },
                avgGarageRating: { $avg: "$garageRating" },
                avgMechanicRating: { $avg: "$mechanicRating" },
                recommendCount: { 
                  $sum: { $cond: [{ $eq: ["$wouldRecommend", true] }, 1, 0] } 
                }
              }
            }
          ],
          mechanicLeaderboard: [
            {
              $group: {
                _id: "$mechanicId",
                averageRating: { $avg: "$mechanicRating" },
                reviewCount: { $sum: 1 }
              }
            },
            { $sort: { averageRating: -1, reviewCount: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "mechanic"
              }
            },
            { $unwind: "$mechanic" },
            {
              $project: {
                _id: 1,
                averageRating: { $round: ["$averageRating", 1] },
                reviewCount: 1,
                mechanicName: "$mechanic.name",
                mechanicEmail: "$mechanic.email"
              }
            }
          ],
          ratingDistribution: [
            {
              $group: {
                _id: "$garageRating",
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: -1 } }
          ],
          recentFeedbacks: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer"
              }
            },
            { $unwind: "$customer" },
            {
              $lookup: {
                from: "users",
                localField: "mechanicId",
                foreignField: "_id",
                as: "mechanic"
              }
            },
            { $unwind: "$mechanic" },
            {
              $project: {
                garageRating: 1,
                mechanicRating: 1,
                comment: 1,
                wouldRecommend: 1,
                createdAt: 1,
                customerName: "$customer.name",
                mechanicName: "$mechanic.name"
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];

    if (!result.overall || result.overall.length === 0) {
      return res.status(200).json({
        overall: { totalFeedbacks: 0, avgGarageRating: 0, avgMechanicRating: 0, recommendPercentage: 0 },
        mechanicLeaderboard: [],
        ratingDistribution: [],
        recentFeedbacks: []
      });
    }

    const overall = result.overall[0];
    const total = overall.totalFeedbacks;
    const recommendPercentage = total > 0 ? ((overall.recommendCount / total) * 100).toFixed(1) : 0;

    res.status(200).json({
      overall: {
        totalFeedbacks: total,
        avgGarageRating: Number(overall.avgGarageRating.toFixed(1)),
        avgMechanicRating: Number(overall.avgMechanicRating.toFixed(1)),
        recommendPercentage: Number(recommendPercentage)
      },
      mechanicLeaderboard: result.mechanicLeaderboard,
      ratingDistribution: result.ratingDistribution,
      recentFeedbacks: result.recentFeedbacks
    });

  } catch (error) {
    res.status(500).json({ message: "Aggregation failed", error: error.message });
  }
};

export const checkFeedbackExists = async (req, res) => {
  try {
    const { jobCardId } = req.params;
    const feedback = await Feedback.findOne({ jobCardId });
    
    res.status(200).json({
      exists: !!feedback,
      feedbackId: feedback ? feedback._id : null
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking feedback status", error: error.message });
  }
};
