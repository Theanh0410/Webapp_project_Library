import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import borrowRoutes from "./routes/borrowRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrows", borrowRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/reports", reportRoutes);


app.get("/", (req, res) => {
  res.send("IU Library backend is running.");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});