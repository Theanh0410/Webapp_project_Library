import express from "express";
import {
  getStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  deleteStaff,
} from "../controllers/staffController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getStaff);
router.post("/", protect, createStaff);
router.put("/:id", protect, updateStaff);
router.put("/:id/status", protect, updateStaffStatus);
router.delete("/:id", protect, deleteStaff);

export default router;