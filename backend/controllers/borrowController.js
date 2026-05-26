import db from "../config/db.js";

const STUDENT_BORROW_DAYS = 14;
const LECTURER_BORROW_DAYS = 28;
const STUDENT_MAX_BOOKS = 3;
const LECTURER_MAX_BOOKS = 5;
const PENALTY_PER_DAY = 5000;

function getBorrowDays(role) {
  return role === "lecturer" ? LECTURER_BORROW_DAYS : STUDENT_BORROW_DAYS;
}

function getMaxBooks(role) {
  return role === "lecturer" ? LECTURER_MAX_BOOKS : STUDENT_MAX_BOOKS;
}

function mapBorrowStatus(dbStatus, dueDate, returnDate) {
  if (dbStatus === "returned") return "returned";
  if (dbStatus === "overdue") return "overdue";

  const today = new Date().toISOString().slice(0, 10);
  if (!returnDate && dueDate < today) return "overdue";

  return "active";
}

function calculatePenalty(dueDate, returnDate) {
  if (!returnDate || returnDate <= dueDate) return undefined;

  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  const daysLate = Math.ceil((returned - due) / (1000 * 60 * 60 * 24));

  return daysLate > 0 ? daysLate * PENALTY_PER_DAY : undefined;
}

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

function mapBorrowRecord(row) {
  const borrowDate = formatDate(row.borrow_date);
  const dueDate = formatDate(row.due_date);
  const returnDate = formatDate(row.return_date);

  return {
    id: String(row.id),
    userId: String(row.borrower_user_id),
    bookId: String(row.book_id),
    borrowDate,
    dueDate,
    returnDate: returnDate || undefined,
    status: mapBorrowStatus(row.status, dueDate, returnDate),
    penalty: calculatePenalty(dueDate, returnDate),
  };
}

export const getBorrowRecords = async (req, res) => {
  try {
    const { userId } = req.query;

    let sql = `
      SELECT
        br.id,
        br.borrower_user_id,
        br.book_copy_id,
        br.borrow_date,
        br.due_date,
        br.return_date,
        br.status,
        bc.book_id,
        b.title AS book_title,
        u.full_name AS borrower_name,
        u.username AS borrower_username
      FROM borrow_records br
      JOIN book_copies bc ON br.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      JOIN users u ON br.borrower_user_id = u.id
    `;

    const params = [];

    if (userId) {
      sql += ` WHERE br.borrower_user_id = ?`;
      params.push(userId);
    }

    sql += ` ORDER BY br.id DESC`;

    const [rows] = await db.query(sql, params);

    return res.json(rows.map(mapBorrowRecord));
  } catch (error) {
    console.error("Get borrow records error:", error);
    return res.status(500).json({
      message: "Server error while loading borrow records.",
    });
  }
};

export const createBorrowRecord = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const requestedUserId = req.body.userId || req.user.id;
    const { bookId } = req.body;

    if (!requestedUserId || !bookId) {
      return res.status(400).json({
        message: "userId and bookId are required.",
      });
    }

    await connection.beginTransaction();

    const [users] = await connection.query(
      `SELECT id, role FROM users WHERE id = ?`,
      [requestedUserId]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: "Borrower not found.",
      });
    }

    const borrower = users[0];

    if (borrower.role !== "student" && borrower.role !== "lecturer") {
      await connection.rollback();
      return res.status(400).json({
        message: "Only students and lecturers can borrow books.",
      });
    }

    const maxBooks = getMaxBooks(borrower.role);

    const [activeBorrows] = await connection.query(
      `
      SELECT id
      FROM borrow_records
      WHERE borrower_user_id = ?
      AND status = 'borrowed'
      `,
      [requestedUserId]
    );

    if (activeBorrows.length >= maxBooks) {
      await connection.rollback();
      return res.status(400).json({
        message: `This user has already borrowed the maximum of ${maxBooks} books.`,
      });
    }

    const [copies] = await connection.query(
      `
      SELECT id
      FROM book_copies
      WHERE book_id = ?
      AND status = 'available'
      LIMIT 1
      FOR UPDATE
      `,
      [bookId]
    );

    if (copies.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "No available copy for this book.",
      });
    }

    const bookCopyId = copies[0].id;
    const borrowDays = getBorrowDays(borrower.role);

    let staffUserId = null;

    if (req.user.role === "staff" || req.user.role === "manager") {
      const [staffRows] = await connection.query(
        `SELECT user_id FROM staff WHERE user_id = ?`,
        [req.user.id]
      );

      if (staffRows.length > 0) {
        staffUserId = req.user.id;
      }
    }

    const [borrowResult] = await connection.query(
      `
      INSERT INTO borrow_records
        (borrower_user_id, book_copy_id, borrow_date, due_date, status, created_by_staff_user_id)
      VALUES
        (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'borrowed', ?)
      `,
      [requestedUserId, bookCopyId, borrowDays, staffUserId]
    );

    await connection.query(
      `UPDATE book_copies SET status = 'borrowed' WHERE id = ?`,
      [bookCopyId]
    );

    const [createdRows] = await connection.query(
      `
      SELECT
        br.id,
        br.borrower_user_id,
        br.book_copy_id,
        br.borrow_date,
        br.due_date,
        br.return_date,
        br.status,
        bc.book_id
      FROM borrow_records br
      JOIN book_copies bc ON br.book_copy_id = bc.id
      WHERE br.id = ?
      `,
      [borrowResult.insertId]
    );

    await connection.commit();

    return res.status(201).json({
      message: "Borrow record created successfully.",
      borrowRecord: mapBorrowRecord(createdRows[0]),
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create borrow record error:", error);

    return res.status(500).json({
      message: "Server error while creating borrow record.",
    });
  } finally {
    connection.release();
  }
};

export const returnBorrowRecord = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [records] = await connection.query(
      `
      SELECT
        br.id,
        br.borrower_user_id,
        br.book_copy_id,
        br.borrow_date,
        br.due_date,
        br.return_date,
        br.status,
        bc.book_id
      FROM borrow_records br
      JOIN book_copies bc ON br.book_copy_id = bc.id
      WHERE br.id = ?
      FOR UPDATE
      `,
      [id]
    );

    if (records.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: "Borrow record not found.",
      });
    }

    const record = records[0];

    if (record.status !== "borrowed") {
      await connection.rollback();
      return res.status(400).json({
        message: "This book has already been returned.",
      });
    }

    await connection.query(
      `
      UPDATE borrow_records
      SET
        return_date = CURDATE(),
        status = CASE
          WHEN due_date < CURDATE() THEN 'overdue'
          ELSE 'returned'
        END
      WHERE id = ?
      `,
      [id]
    );

    await connection.query(
      `UPDATE book_copies SET status = 'available' WHERE id = ?`,
      [record.book_copy_id]
    );

    const [updatedRows] = await connection.query(
      `
      SELECT
        br.id,
        br.borrower_user_id,
        br.book_copy_id,
        br.borrow_date,
        br.due_date,
        br.return_date,
        br.status,
        bc.book_id
      FROM borrow_records br
      JOIN book_copies bc ON br.book_copy_id = bc.id
      WHERE br.id = ?
      `,
      [id]
    );

    await connection.commit();

    const updatedRecord = mapBorrowRecord(updatedRows[0]);

    return res.json({
      message: updatedRecord.penalty
        ? `Book returned. Penalty: ${updatedRecord.penalty.toLocaleString("vi-VN")}đ`
        : "Book returned successfully.",
      borrowRecord: updatedRecord,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Return borrow record error:", error);

    return res.status(500).json({
      message: "Server error while returning book.",
    });
  } finally {
    connection.release();
  }
};