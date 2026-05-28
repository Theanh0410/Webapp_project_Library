import bcrypt from "bcryptjs";
import db from "../config/db.js";

function mapStaff(row) {
  return {
    id: String(row.id),
    userId: String(row.id),
    full_name: row.full_name,
    email: row.email,
    username: row.username,
    role: row.position && row.position.toLowerCase().includes("manager") ? "manager" : "staff",
    position: row.position || "Library Staff",
    status: row.is_active ? "active" : "inactive",
    shifts: row.shifts ? row.shifts.split("|").filter(Boolean) : [],
  };
}

export const getStaff = async (req, res) => {
  try {
  const [rows] = await db.query(`
    SELECT
      u.id,
      u.full_name,
      u.username,
      u.email,
      u.role,
      s.position,
      s.is_active,
      GROUP_CONCAT(sh.note SEPARATOR '|') AS shifts
    FROM users u
    JOIN staff s ON u.id = s.user_id
    LEFT JOIN shifts sh ON s.user_id = sh.staff_user_id
    WHERE u.role IN ('staff', 'manager')
    GROUP BY
      u.id,
      u.full_name,
      u.username,
      u.email,
      u.role,
      s.position,
      s.is_active
    ORDER BY u.id ASC
  `);

    return res.json(rows.map(mapStaff));
  } catch (error) {
    console.error("Get staff error:", error);
    return res.status(500).json({
      message: "Server error while loading staff.",
    });
  }
};

export const createStaff = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      username,
      full_name,
      email,
      password,
      position,
    } = req.body;

    const staffName = full_name;
    const staffUsername = username;
    const staffPosition = position || "Library Staff";

    if (!staffName || !staffUsername || !email) {
      return res.status(400).json({
        message: "Staff name, username, and email are required.",
      });
    }

    await connection.beginTransaction();

    const [existing] = await connection.query(
      `SELECT id FROM users WHERE username = ? OR email = ?`,
      [staffUsername.trim(), email.trim().toLowerCase()]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        message: "Username or email already exists.",
      });
    }

    const defaultPassword = password || "123456";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const userRole = staffPosition.toLowerCase().includes("manager")
      ? "manager"
      : "staff";

    const [userResult] = await connection.query(
      `
      INSERT INTO users (full_name, username, password_hash, email, role)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        staffName.trim(),
        staffUsername.trim(),
        passwordHash,
        email.trim().toLowerCase(),
        userRole,
      ]
    );

    const userId = userResult.insertId;

    await connection.query(
      `
      INSERT INTO staff (user_id, position, is_active)
      VALUES (?, ?, TRUE)
      `,
      [userId, staffPosition]
    );

    await connection.commit();

    return res.status(201).json({
      message: "Staff created successfully.",
      staff: {
        id: String(userId),
        full_name: staffName.trim(),
        email: email.trim().toLowerCase(),
        username: staffUsername.trim(),
        role: userRole,
        position: staffPosition,
        status: "active",
        shifts: [],
      },
      defaultPassword,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create staff error:", error);

    return res.status(500).json({
      message: "Server error while creating staff.",
    });
  } finally {
    connection.release();
  }
};

export const updateStaff = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const {
      full_name,
      username,
      email,
      position,
    } = req.body;

    const staffName = full_name;
    const staffUsername = username;

    if (!staffName || !staffUsername || !email) {
      return res.status(400).json({
        message: "Staff name, username, and email are required.",
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

    const staffPosition = position || "Library Staff";
    const userRole = staffPosition.toLowerCase().includes("manager")
      ? "manager"
      : "staff";

    await connection.query(
      `
      UPDATE users
      SET full_name = ?, username = ?, email = ?, role = ?
      WHERE id = ?
      `,
      [
        staffName.trim(),
        staffUsername.trim(),
        email.trim().toLowerCase(),
        userRole,
        id,
      ]
    );

    await connection.query(
      `
      UPDATE staff
      SET position = ?
      WHERE user_id = ?
      `,
      [staffPosition, id]
    );

    await connection.commit();

    return res.json({
      message: "Staff updated successfully.",
      staff: {
        id: String(id),
        userId: String(id),
        full_name: staffName.trim(),
        email: email.trim().toLowerCase(),
        username: staffUsername.trim(),
        role: userRole,
        position: staffPosition,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Update staff error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Username or email already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error while updating staff.",
    });
  } finally {
    connection.release();
  }
};

export const updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        message: "is_active must be true or false.",
      });
    }

    const [result] = await db.query(
      `
      UPDATE staff
      SET is_active = ?
      WHERE user_id = ?
      `,
      [is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Staff not found.",
      });
    }

    return res.json({
      message: is_active
        ? "Staff activated successfully."
        : "Staff deactivated successfully.",
      staffId: String(id),
      status: is_active ? "active" : "inactive",
      is_active,
    });
  } catch (error) {
    console.error("Update staff status error:", error);
    return res.status(500).json({
      message: "Server error while updating staff status.",
    });
  }
};

export const deleteStaff = async (req, res) => {
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

    await db.query(`DELETE FROM users WHERE id = ?`, [id]);

    return res.json({
      message: "Staff deleted successfully.",
      staffId: String(id),
    });
  } catch (error) {
    console.error("Delete staff error:", error);
    return res.status(500).json({
      message: "Server error while deleting staff.",
    });
  }
};