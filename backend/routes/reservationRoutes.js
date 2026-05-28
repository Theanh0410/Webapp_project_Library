import express from "express";
import {
  getReservations,
  createReservation,
  cancelReservation,
  approveReservation,
} from "../controllers/reservationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getReservations);
router.post("/", protect, createReservation);
router.put("/:id/cancel", protect, cancelReservation);
router.put("/:id/approve", protect, approveReservation);

export default router;