import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  submitFeedback,
  getAllFeedback,
  getMyFeedback,
  getMechanicFeedback,
  getFeedbackStats,
  checkFeedbackExists
} from "../controllers/feedbackController.js";

const router = express.Router();

/*
 * Feedback Routes Documentation
 * --------------------------------------------------------------------------
 * POST   /api/feedback                → Authenticated Customer submits feedback
 * GET    /api/feedback/all            → Admin lists all system feedbacks
 * GET    /api/feedback/my             → Customer views their specific history
 * GET    /api/feedback/mechanic/me     → Mechanic checks personal ratings/stats
 * GET    /api/feedback/stats          → Admin aggregated analytical dashboards
 * GET    /api/feedback/check/:jobCardId → Check eligibility for review
 */

// 1. Submit a review (Customer only)
router.post("/", protect, authorizeRoles("customer"), submitFeedback);

// 2. View all submitted feedback (Admin only)
router.get("/all", protect, authorizeRoles("admin"), getAllFeedback);

// 3. View my own reviews (Customer only)
router.get("/my", protect, authorizeRoles("customer"), getMyFeedback);

// 4. View feedback addressed to me (Staff/Mechanic only)
router.get("/mechanic/me", protect, authorizeRoles("staff"), getMechanicFeedback);

// 5. High-level aggregation metrics (Admin only)
router.get("/stats", protect, authorizeRoles("admin"), getFeedbackStats);

// 6. Pre-check for duplicate/eligibility (Customer only)
router.get("/check/:jobCardId", protect, authorizeRoles("customer"), checkFeedbackExists);

export default router;
