import express from "express";
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
  getSubjects,
} from "../controllers/bookController.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Book route is working" });
});

router.get("/categories", getCategories);
router.get("/subjects", getSubjects);

router.get("/", getBooks);
router.post("/", createBook);

router.get("/:id", getBookById);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);


export default router;