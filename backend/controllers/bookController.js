import db from "../config/db.js";

function mapBook(row) {
  return {
    id: String(row.id),
    code: row.isbn || `BOOK-${row.id}`,
    title: row.title,
    author: row.author || "Unknown",
    discipline: row.category_name || "Other",
    available: Number(row.available_copies) > 0,
    shelf: row.shelf || "General",
  };
}

export const getBooks = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.id,
        b.title,
        b.author,
        b.isbn,
        b.description,
        c.name AS category_name,
        COUNT(bc.id) AS total_copies,
        SUM(CASE WHEN bc.status = 'available' THEN 1 ELSE 0 END) AS available_copies
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN book_copies bc ON b.id = bc.book_id
      GROUP BY b.id, b.title, b.author, b.isbn, b.description, c.name
      ORDER BY b.id DESC
    `);

    const books = rows.map(mapBook);

    return res.json(books);
  } catch (error) {
    console.error("Get books error:", error);
    return res.status(500).json({
      message: "Server error while loading books.",
    });
  }
};

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        b.id,
        b.title,
        b.author,
        b.isbn,
        b.description,
        c.name AS category_name,
        COUNT(bc.id) AS total_copies,
        SUM(CASE WHEN bc.status = 'available' THEN 1 ELSE 0 END) AS available_copies
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN book_copies bc ON b.id = bc.book_id
      WHERE b.id = ?
      GROUP BY b.id, b.title, b.author, b.isbn, b.description, c.name
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Book not found.",
      });
    }

    return res.json(mapBook(rows[0]));
  } catch (error) {
    console.error("Get book by id error:", error);
    return res.status(500).json({
      message: "Server error while loading book.",
    });
  }
};

export const createBook = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      title,
      author,
      code,
      isbn,
      discipline,
      description,
      publishedYear,
      copies,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Book title is required.",
      });
    }

    await connection.beginTransaction();

    let categoryId = null;

    if (discipline) {
      const [existingCategory] = await connection.query(
        "SELECT id FROM categories WHERE name = ?",
        [discipline]
      );

      if (existingCategory.length > 0) {
        categoryId = existingCategory[0].id;
      } else {
        const [categoryResult] = await connection.query(
          "INSERT INTO categories (name) VALUES (?)",
          [discipline]
        );
        categoryId = categoryResult.insertId;
      }
    }

    const bookIsbn = isbn || code || null;

    const [bookResult] = await connection.query(
      `
      INSERT INTO books 
        (title, author, published_year, isbn, category_id, description)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        title.trim(),
        author?.trim() || null,
        publishedYear || null,
        bookIsbn,
        categoryId,
        description?.trim() || null,
      ]
    );

    const bookId = bookResult.insertId;
    const copyCount = Number(copies) > 0 ? Number(copies) : 1;

    for (let i = 0; i < copyCount; i++) {
      await connection.query(
        "INSERT INTO book_copies (book_id, status) VALUES (?, 'available')",
        [bookId]
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: "Book created successfully.",
      book: {
        id: String(bookId),
        code: bookIsbn || `BOOK-${bookId}`,
        title: title.trim(),
        author: author?.trim() || "Unknown",
        discipline: discipline || "Other",
        available: true,
        shelf: "General",
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create book error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Book code or ISBN already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error while creating book.",
    });
  } finally {
    connection.release();
  }
};

export const updateBook = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const {
      title,
      author,
      code,
      isbn,
      discipline,
      description,
      publishedYear,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Book title is required.",
      });
    }

    await connection.beginTransaction();

    let categoryId = null;

    if (discipline) {
      const [existingCategory] = await connection.query(
        "SELECT id FROM categories WHERE name = ?",
        [discipline]
      );

      if (existingCategory.length > 0) {
        categoryId = existingCategory[0].id;
      } else {
        const [categoryResult] = await connection.query(
          "INSERT INTO categories (name) VALUES (?)",
          [discipline]
        );
        categoryId = categoryResult.insertId;
      }
    }

    const bookIsbn = isbn || code || null;

    const [result] = await connection.query(
      `
      UPDATE books
      SET title = ?, author = ?, published_year = ?, isbn = ?, category_id = ?, description = ?
      WHERE id = ?
      `,
      [
        title.trim(),
        author?.trim() || null,
        publishedYear || null,
        bookIsbn,
        categoryId,
        description?.trim() || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: "Book not found.",
      });
    }

    await connection.commit();

    return res.json({
      message: "Book updated successfully.",
      book: {
        id: String(id),
        code: bookIsbn || `BOOK-${id}`,
        title: title.trim(),
        author: author?.trim() || "Unknown",
        discipline: discipline || "Other",
        available: true,
        shelf: "General",
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Update book error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Book code or ISBN already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error while updating book.",
    });
  } finally {
    connection.release();
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const [activeBorrows] = await db.query(
      `
      SELECT br.id
      FROM borrow_records br
      JOIN book_copies bc ON br.book_copy_id = bc.id
      WHERE bc.book_id = ?
      AND br.status = 'borrowed'
      `,
      [id]
    );

    if (activeBorrows.length > 0) {
      return res.status(400).json({
        message: "Cannot delete this book because it is currently borrowed.",
      });
    }

    const [result] = await db.query("DELETE FROM books WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Book not found.",
      });
    }

    return res.json({
      message: "Book deleted successfully.",
    });
  } catch (error) {
    console.error("Delete book error:", error);
    return res.status(500).json({
      message: "Server error while deleting book.",
    });
  }
};