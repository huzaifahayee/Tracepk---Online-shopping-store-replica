const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../config/db");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const router = express.Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = (req.body.email || "").trim();
    const password = String(req.body.password || "");

    if (!email) {
      throw new ApiError(400, "VALIDATION_ERROR", "email is required", "email");
    }
    if (!password) {
      throw new ApiError(400, "VALIDATION_ERROR", "password is required", "password");
    }

    const pool = await getPool();
    const result = await pool.request().input("email", sql.VarChar(100), email).query(`
      SELECT admin_id, username, email, full_name, password_hash
      FROM Admins
      WHERE email = @email
    `);

    const admin = result.recordset[0];
    if (!admin) {
      throw new ApiError(404, "NOT_FOUND", "email not found");
    }

    // Support both proper bcrypt hashes and plain-text seed/demo passwords.
    const storedHash = String(admin.password_hash || "");
    const looksLikeBcryptHash = storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$");
    const isMatch = looksLikeBcryptHash
      ? await bcrypt.compare(password, storedHash)
      : password === storedHash;

    if (!isMatch) {
      throw new ApiError(401, "UNAUTHORIZED", "invalid credentials");
    }

    const token = jwt.sign({ type: "admin", adminId: admin.admin_id }, env.jwtSecret, {
      expiresIn: "1d",
    });

    delete admin.password_hash;

    return res.json({
      success: true,
      data: { token, admin },
    });
  })
);

module.exports = router;
