import db from "../config/db.js";

function mapUser(row) {
  let frontendRole = row.role;

  if (
    row.role === "staff" &&
    row.position &&
    row.position.toLowerCase().includes("manager")
  ) {
    frontendRole = "manager";
  }

  return {
    id: String(row.id),
    username: row.username,
    full_name: row.full_name,
    email: row.email,
    role: frontendRole,
    position: row.position || null,
  };
}

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let sql = `
      SELECT
        u.id,
        u.username,
        u.full_name,
        u.email,
        u.role,
        s.position
      FROM users u
      LEFT JOIN staff s ON u.id = s.user_id
    `;

    const params = [];

    if (role) {
      if (!["student", "lecturer", "staff", "manager"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role filter.",
        });
      }

      if (role === "manager") {
        sql += `
          WHERE u.role = 'staff'
          AND LOWER(s.position) LIKE '%manager%'
        `;
      } else if (role === "staff") {
        sql += `
          WHERE u.role = 'staff'
          AND (
            s.position IS NULL
            OR LOWER(s.position) NOT LIKE '%manager%'
          )
        `;
      } else {
        sql += ` WHERE u.role = ?`;
        params.push(role);
      }
    }

    sql += ` ORDER BY u.id ASC`;

    const [rows] = await db.query(sql, params);

    return res.json(rows.map(mapUser));
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Server error while loading users.",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        u.id,
        u.username,
        u.full_name,
        u.email,
        u.role,
        s.position
      FROM users u
      LEFT JOIN staff s ON u.id = s.user_id
      WHERE u.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json(mapUser(rows[0]));
  } catch (error) {
    console.error("Get user by id error:", error);

    return res.status(500).json({
      message: "Server error while loading user.",
    });
  }
};