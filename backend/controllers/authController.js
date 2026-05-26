import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

function getRedirectPath(role) {
  return "/dashboard";
}

export const register = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      fullName,
      username,
      email,
      password,
      role,
      studentCode,
      major,
      className,
      department,
    } = req.body;

    if (!fullName || !username || !password || !role) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    if (!["student", "lecturer"].includes(role)) {
      return res.status(400).json({
        message: "Only students and lecturers can register.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const [existingUsers] = await connection.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username.trim(), email?.trim().toLowerCase() || null]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "Username or email already exists.",
      });
    }

    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 10);

    const [userResult] = await connection.query(
      `INSERT INTO users (full_name, username, password_hash, email, role)
       VALUES (?, ?, ?, ?, ?)`,
      [
        fullName.trim(),
        username.trim(),
        passwordHash,
        email?.trim().toLowerCase() || null,
        role,
      ]
    );

    const userId = userResult.insertId;

    if (role === "student") {
      await connection.query(
        `INSERT INTO students (user_id, student_code, major, class_name)
         VALUES (?, ?, ?, ?)`,
        [
          userId,
          studentCode?.trim() || username.trim(),
          major?.trim() || null,
          className?.trim() || null,
        ]
      );
    }

    if (role === "lecturer") {
      await connection.query(
        `INSERT INTO lecturers (user_id, department)
         VALUES (?, ?)`,
        [userId, department?.trim() || null]
      );
    }

    await connection.commit();

    const user = {
      id: userId,
      fullName: fullName.trim(),
      username: username.trim(),
      email: email?.trim().toLowerCase() || null,
      role,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      message: "Register successful.",
      token,
      user,
      redirectTo: getRedirectPath(),
    });
  } catch (error) {
    await connection.rollback();
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Server error during registration.",
    });
  } finally {
    connection.release();
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Please enter username and password.",
      });
    }

    const [users] = await db.query(
      `SELECT 
        u.id,
        u.full_name,
        u.username,
        u.password_hash,
        u.email,
        u.role,
        s.position
      FROM users u
      LEFT JOIN staff s ON u.id = s.user_id
      WHERE u.username = ?`,
      [username.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Username does not exist.",
      });
    }

    const foundUser = users[0];

    let frontendRole = foundUser.role;

    if (
      foundUser.role === "staff" &&
      foundUser.position &&
      foundUser.position.toLowerCase().includes("manager")
    ) {
      frontendRole = "manager";
    }

    const isMatch = await bcrypt.compare(password, foundUser.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    const user = {
      id: foundUser.id,
      fullName: foundUser.full_name,
      username: foundUser.username,
      email: foundUser.email,
      role: frontendRole,
      position: foundUser.position,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      message: "Login successful.",
      token,
      user,
      redirectTo: getRedirectPath(),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
};