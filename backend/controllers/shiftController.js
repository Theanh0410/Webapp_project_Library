import db from "../config/db.js";

const SHIFT_TIME_MAP = {
  morning: {
    start: "08:00:00",
    end: "12:00:00",
  },
  afternoon: {
    start: "13:00:00",
    end: "17:00:00",
  },
  evening: {
    start: "17:00:00",
    end: "21:00:00",
  },
};

const DAY_MAP = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getNextDateForDay(dayName) {
  const targetDay = DAY_MAP[dayName.toLowerCase()];
  const today = new Date();

  const result = new Date(today);
  let diff = targetDay - today.getDay();

  if (diff < 0) {
    diff += 7;
  }

  result.setDate(today.getDate() + diff);

  return formatDate(result);
}

function parseShiftLabel(label) {
  const cleanLabel = String(label).trim();
  const lower = cleanLabel.toLowerCase();

  const dayName = Object.keys(DAY_MAP).find((day) => lower.includes(day));
  const timeKey = Object.keys(SHIFT_TIME_MAP).find((time) =>
    lower.includes(time)
  );

  if (!dayName || !timeKey) {
    throw new Error(
      `Invalid shift format: ${cleanLabel}. Example: Monday Morning`
    );
  }

  return {
    label: cleanLabel,
    shift_date: getNextDateForDay(dayName),
    start_time: SHIFT_TIME_MAP[timeKey].start,
    end_time: SHIFT_TIME_MAP[timeKey].end,
  };
}

function mapShift(row) {
  return {
    id: String(row.id),
    staffUserId: String(row.staff_user_id),
    shiftDate: row.shift_date
      ? new Date(row.shift_date).toISOString().slice(0, 10)
      : null,
    startTime: row.start_time,
    endTime: row.end_time,
    note: row.note || null,
    label: row.note || `${row.shift_date} ${row.start_time}-${row.end_time}`,
  };
}

export const getAllShifts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        sh.id,
        sh.staff_user_id,
        sh.shift_date,
        sh.start_time,
        sh.end_time,
        sh.note,
        u.full_name,
        u.username
      FROM shifts sh
      JOIN users u ON sh.staff_user_id = u.id
      ORDER BY sh.shift_date ASC, sh.start_time ASC
    `);

    return res.json(rows.map(mapShift));
  } catch (error) {
    console.error("Get all shifts error:", error);
    return res.status(500).json({
      message: "Server error while loading shifts.",
    });
  }
};

export const getStaffShifts = async (req, res) => {
  try {
    const { id } = req.params;

    const [staffRows] = await db.query(
      `SELECT user_id FROM staff WHERE user_id = ?`,
      [id]
    );

    if (staffRows.length === 0) {
      return res.status(404).json({
        message: "Staff not found.",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        id,
        staff_user_id,
        shift_date,
        start_time,
        end_time,
        note
      FROM shifts
      WHERE staff_user_id = ?
      ORDER BY shift_date ASC, start_time ASC
      `,
      [id]
    );

    return res.json({
      staffId: String(id),
      shifts: rows.map((row) => row.note),
      records: rows.map(mapShift),
    });
  } catch (error) {
    console.error("Get staff shifts error:", error);
    return res.status(500).json({
      message: "Server error while loading staff shifts.",
    });
  }
};

export const addStaffShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { shift } = req.body;

    if (!shift) {
      return res.status(400).json({
        message: "Shift is required.",
      });
    }

    const [staffRows] = await db.query(
      `SELECT user_id FROM staff WHERE user_id = ?`,
      [id]
    );

    if (staffRows.length === 0) {
      return res.status(404).json({
        message: "Staff not found.",
      });
    }

    const parsedShift = parseShiftLabel(shift);

    await db.query(
      `
      INSERT INTO shifts
        (staff_user_id, shift_date, start_time, end_time, note)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        id,
        parsedShift.shift_date,
        parsedShift.start_time,
        parsedShift.end_time,
        parsedShift.label,
      ]
    );

    const [rows] = await db.query(
      `
      SELECT note
      FROM shifts
      WHERE staff_user_id = ?
      ORDER BY shift_date ASC, start_time ASC
      `,
      [id]
    );

    return res.status(201).json({
      message: "Shift added successfully.",
      staffId: String(id),
      shifts: rows.map((row) => row.note),
    });
  } catch (error) {
    console.error("Add staff shift error:", error);

    return res.status(400).json({
      message: error.message || "Server error while adding shift.",
    });
  }
};

export const updateStaffShifts = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const { shifts } = req.body;

    if (!Array.isArray(shifts)) {
      return res.status(400).json({
        message: "shifts must be an array.",
      });
    }

    await connection.beginTransaction();

    const [staffRows] = await connection.query(
      `SELECT user_id FROM staff WHERE user_id = ?`,
      [id]
    );

    if (staffRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: "Staff not found.",
      });
    }

    await connection.query(`DELETE FROM shifts WHERE staff_user_id = ?`, [id]);

    const cleanShifts = [
      ...new Set(shifts.map((s) => String(s).trim()).filter(Boolean)),
    ];

    for (const shift of cleanShifts) {
      const parsedShift = parseShiftLabel(shift);

      await connection.query(
        `
        INSERT INTO shifts
          (staff_user_id, shift_date, start_time, end_time, note)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          id,
          parsedShift.shift_date,
          parsedShift.start_time,
          parsedShift.end_time,
          parsedShift.label,
        ]
      );
    }

    await connection.commit();

    return res.json({
      message: "Staff shifts updated successfully.",
      staffId: String(id),
      shifts: cleanShifts,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Update staff shifts error:", error);

    return res.status(400).json({
      message: error.message || "Server error while updating staff shifts.",
    });
  } finally {
    connection.release();
  }
};