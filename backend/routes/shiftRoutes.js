import express from "express";
import {
  getAllShifts,
  getStaffShifts,
  addStaffShift,
  updateStaffShifts,
} from "../controllers/shiftController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/shifts", protect, getAllShifts);

router.get("/staff/:id/shifts", protect, getStaffShifts);
router.post("/staff/:id/shifts", protect, addStaffShift);
router.put("/staff/:id/shifts", protect, updateStaffShifts);

export default router;