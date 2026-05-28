import express from "express";
import { getSummaryReport } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, getSummaryReport);

export default router;