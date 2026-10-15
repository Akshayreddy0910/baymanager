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


router.post("/", protect, authorizeRoles("customer"), submitFeedback);

router.get("/all", protect, authorizeRoles("admin"), getAllFeedback);

router.get("/my", protect, authorizeRoles("customer"), getMyFeedback);

router.get("/mechanic/me", protect, authorizeRoles("staff"), getMechanicFeedback);

router.get("/stats", protect, authorizeRoles("admin"), getFeedbackStats);

router.get("/check/:jobCardId", protect, authorizeRoles("customer"), checkFeedbackExists);

export default router;
