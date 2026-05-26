import express from "express";
import {
  getBorrowRecords,
  createBorrowRecord,
  returnBorrowRecord,
} from "../controllers/borrowController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getBorrowRecords);
router.post("/", protect, createBorrowRecord);
router.put("/:id/return", protect, returnBorrowRecord);

export default router;