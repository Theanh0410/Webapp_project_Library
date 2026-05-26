import db from "../config/db.js";

export const getSummaryReport = async (req, res) => {
  try {
    const [[bookStats]] = await db.query(`
      SELECT
        COUNT(DISTINCT b.id) AS totalBooks,
        SUM(CASE WHEN bc.status = 'available' THEN 1 ELSE 0 END) AS availableBooks,
        SUM(CASE WHEN bc.status = 'borrowed' THEN 1 ELSE 0 END) AS borrowedBooks
      FROM books b
      LEFT JOIN book_copies bc ON b.id = bc.book_id
    `);

    const [[userStats]] = await db.query(`
      SELECT
        COUNT(*) AS totalUsers
      FROM users
    `);

    const [[staffStats]] = await db.query(`
      SELECT
        COUNT(*) AS totalStaff
      FROM staff
    `);

    const [[overdueStats]] = await db.query(`
      SELECT
        COUNT(*) AS overdueBorrows
      FROM borrow_records
      WHERE status = 'borrowed'
      AND due_date < CURDATE()
    `);

    const [[reservationStats]] = await db.query(`
      SELECT
        COUNT(*) AS pendingReservations
      FROM reservations
      WHERE status = 'pending'
    `);

    return res.json({
      totalBooks: Number(bookStats.totalBooks || 0),
      availableBooks: Number(bookStats.availableBooks || 0),
      borrowedBooks: Number(bookStats.borrowedBooks || 0),
      totalUsers: Number(userStats.totalUsers || 0),
      totalStaff: Number(staffStats.totalStaff || 0),
      overdueBorrows: Number(overdueStats.overdueBorrows || 0),
      pendingReservations: Number(reservationStats.pendingReservations || 0),
    });
  } catch (error) {
    console.error("Get summary report error:", error);

    return res.status(500).json({
      message: "Server error while loading summary report.",
    });
  }
};