import express from "express";
import {
  getReservations,
  createReservation,
  cancelReservation,
  approveReservation,
  processReadyReservationsEndpoint,
} from "../controllers/reservationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getReservations);
router.post("/", protect, createReservation);
router.put("/:id/cancel", protect, cancelReservation);
router.put("/:id/approve", protect, approveReservation);
router.post("/process-ready", protect, processReadyReservationsEndpoint);

export default router;