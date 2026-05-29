import express from "express";
import {
  getBorrowRecords,
  createBorrowRecord,
  returnBorrowRecord,
  getBorrowReminders,
  getPendingApprovals,
  approveBorrowRequest,
  getPendingReturns,
  approveReturnRequest,
} from "../controllers/borrowController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getBorrowRecords);
router.post("/", protect, createBorrowRecord);
router.get("/reminders", protect, getBorrowReminders);
router.get("/pending-approvals", protect, getPendingApprovals);
router.get("/pending-returns", protect, getPendingReturns);
router.put("/:id/return", protect, returnBorrowRecord);
router.put("/:id/approve", protect, approveBorrowRequest);
router.put("/:id/approve-return", protect, approveReturnRequest);

export default router;