import db from "../config/db.js";

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

function mapReservationStatus(dbStatus) {
  if (dbStatus === "approved") return "ready";
  if (dbStatus === "cancelled") return "cancelled";
  if (dbStatus === "completed") return "ready";
  return "pending";
}

function mapReservation(row) {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    bookId: String(row.book_id),
    orderDate: formatDate(row.reservation_date),
    status: mapReservationStatus(row.status),
  };
}

export const getReservations = async (req, res) => {
  try {
    const { userId } = req.query;

    let sql = `
      SELECT
        r.id,
        r.user_id,
        r.book_id,
        r.reservation_date,
        r.status,
        b.title AS book_title,
        u.full_name AS user_name,
        u.username
      FROM reservations r
      JOIN books b ON r.book_id = b.id
      JOIN users u ON r.user_id = u.id
    `;

    const params = [];

    if (userId) {
      sql += ` WHERE r.user_id = ?`;
      params.push(userId);
    }

    sql += ` ORDER BY r.id DESC`;

    const [rows] = await db.query(sql, params);

    return res.json(rows.map(mapReservation));
  } catch (error) {
    console.error("Get reservations error:", error);
    return res.status(500).json({
      message: "Server error while loading reservations.",
    });
  }
};

export const createReservation = async (req, res) => {
  try {
    const userId = req.body.userId || req.user.id;
    const { bookId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({
        message: "userId and bookId are required.",
      });
    }

    const [books] = await db.query(`SELECT id FROM books WHERE id = ?`, [
      bookId,
    ]);

    if (books.length === 0) {
      return res.status(404).json({
        message: "Book not found.",
      });
    }

    const [availableCopies] = await db.query(
      `
      SELECT id
      FROM book_copies
      WHERE book_id = ?
      AND status = 'available'
      LIMIT 1
      `,
      [bookId]
    );

    if (availableCopies.length > 0) {
      return res.status(400).json({
        message: "Book is available. You can borrow it directly.",
      });
    }

    const [duplicates] = await db.query(
      `
      SELECT id
      FROM reservations
      WHERE user_id = ?
      AND book_id = ?
      AND status IN ('pending', 'approved')
      `,
      [userId, bookId]
    );

    if (duplicates.length > 0) {
      return res.status(409).json({
        message: "You already reserved this book.",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO reservations (user_id, book_id, reservation_date, status)
      VALUES (?, ?, CURDATE(), 'pending')
      `,
      [userId, bookId]
    );

    const [createdRows] = await db.query(
      `
      SELECT
        id,
        user_id,
        book_id,
        reservation_date,
        status
      FROM reservations
      WHERE id = ?
      `,
      [result.insertId]
    );

    return res.status(201).json({
      message: "Reservation created successfully.",
      reservation: mapReservation(createdRows[0]),
    });
  } catch (error) {
    console.error("Create reservation error:", error);
    return res.status(500).json({
      message: "Server error while creating reservation.",
    });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `
      UPDATE reservations
      SET status = 'cancelled'
      WHERE id = ?
      AND status IN ('pending', 'approved')
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Reservation not found or cannot be cancelled.",
      });
    }

    return res.json({
      message: "Reservation cancelled successfully.",
      reservationId: String(id),
    });
  } catch (error) {
    console.error("Cancel reservation error:", error);
    return res.status(500).json({
      message: "Server error while cancelling reservation.",
    });
  }
};

export const approveReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `
      UPDATE reservations
      SET status = 'approved'
      WHERE id = ?
      AND status = 'pending'
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Reservation not found or cannot be approved.",
      });
    }

    return res.json({
      message: "Reservation approved successfully.",
      reservationId: String(id),
      status: "ready",
    });
  } catch (error) {
    console.error("Approve reservation error:", error);
    return res.status(500).json({
      message: "Server error while approving reservation.",
    });
  }
};