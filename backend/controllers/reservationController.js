import db from "../config/db.js";

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

function mapReservationStatus(dbStatus) {
  if (dbStatus === "approved") return "ready";
  if (dbStatus === "completed") return "completed";
  if (dbStatus === "cancelled") return "cancelled";
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

    const [books] = await db.query(
      `
      SELECT id
      FROM books
      WHERE id = ?
      `,
      [bookId]
    );

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
      message: "Reservation request sent successfully.",
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

/**
 * Call this after a returned book is approved.
 * It checks whether that book has a pending reservation.
 * If yes, it creates a borrow request automatically.
 */
export const processReadyReservations = async (bookId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Find one available copy of this book
    const [availableCopies] = await connection.query(
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

    if (availableCopies.length === 0) {
      await connection.rollback();
      return {
        created: false,
        message: "No available copy.",
      };
    }

    const copyId = availableCopies[0].id;

    // 2. Find the earliest pending reservation
    const [reservations] = await connection.query(
      `
      SELECT id, user_id, book_id
      FROM reservations
      WHERE book_id = ?
      AND status = 'pending'
      ORDER BY reservation_date ASC, id ASC
      LIMIT 1
      FOR UPDATE
      `,
      [bookId]
    );

    if (reservations.length === 0) {
      await connection.rollback();
      return {
        created: false,
        message: "No pending reservation.",
      };
    }

    const reservation = reservations[0];

    // 3. Check duplicate borrow request for this user and this book
    const [existingBorrowRequests] = await connection.query(
      `
      SELECT br.id
      FROM borrow_records br
      JOIN book_copies bc ON br.book_copy_id = bc.id
      WHERE br.borrower_user_id = ?
      AND bc.book_id = ?
      AND br.status IN (
        'pending_approval',
        'approved',
        'pending_return_approval',
        'overdue'
      )
      LIMIT 1
      `,
      [reservation.user_id, reservation.book_id]
    );

    if (existingBorrowRequests.length > 0) {
      await connection.query(
        `
        UPDATE reservations
        SET status = 'completed'
        WHERE id = ?
        `,
        [reservation.id]
      );

      await connection.commit();

      return {
        created: false,
        message: "Borrow request already exists.",
      };
    }

    // 4. Get borrower role to calculate due date
    const [users] = await connection.query(
      `
      SELECT role
      FROM users
      WHERE id = ?
      `,
      [reservation.user_id]
    );

    if (users.length === 0) {
      await connection.rollback();
      return {
        created: false,
        message: "Reservation user not found.",
      };
    }

    const borrowDays = users[0].role === "lecturer" ? 28 : 14;

    // 5. Create borrow request automatically
    await connection.query(
      `
      INSERT INTO borrow_records
        (
          borrower_user_id,
          book_copy_id,
          borrow_date,
          due_date,
          status,
          created_by_staff_user_id,
          approved_by_staff_user_id,
          return_approved_by_staff_user_id
        )
      VALUES
        (
          ?,
          ?,
          CURDATE(),
          DATE_ADD(CURDATE(), INTERVAL ? DAY),
          'pending_approval',
          NULL,
          NULL,
          NULL
        )
      `,
      [reservation.user_id, copyId, borrowDays]
    );

    // 6. Lock this copy for the reserved student
    await connection.query(
      `
      UPDATE book_copies
      SET status = 'borrowed'
      WHERE id = ?
      `,
      [copyId]
    );

    // 7. Mark reservation as ready
    await connection.query(
      `
      UPDATE reservations
      SET status = 'completed'
      WHERE id = ?
      `,
      [reservation.id]
    );

    await connection.commit();

    return {
      created: true,
      reservationId: String(reservation.id),
      borrowerUserId: String(reservation.user_id),
      bookId: String(reservation.book_id),
      bookCopyId: String(copyId),
      message: "Reservation is ready. Borrow request created automatically.",
    };
  } catch (error) {
    await connection.rollback();
    console.error("Process ready reservations DB error:", error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Optional manual approve reservation endpoint.
 * Keep this only if you still want staff to manually mark a reservation ready.
 */
export const approveReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const [reservations] = await db.query(
      `
      SELECT book_id
      FROM reservations
      WHERE id = ?
      AND status = 'pending'
      `,
      [id]
    );

    if (reservations.length === 0) {
      return res.status(404).json({
        message: "Reservation not found or cannot be approved.",
      });
    }

    const result = await processReadyReservations(reservations[0].book_id);

    return res.json(result);
  } catch (error) {
    console.error("Approve reservation error:", error);
    return res.status(500).json({
      message: "Server error while approving reservation.",
    });
  }
};

export const processReadyReservationsEndpoint = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        message: "bookId is required.",
      });
    }

    const result = await processReadyReservations(bookId);

    return res.json(result);
  } catch (error) {
    console.error("Process ready reservations error:", error);
    return res.status(500).json({
      message: error.message || "Server error while processing ready reservations.",
    });
  }
};