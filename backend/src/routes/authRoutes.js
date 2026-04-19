const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../config/db");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const router = express.Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { username, email, password, full_name, phone_number, address } =
      req.body;

    if (!username) {
      throw new ApiError(400, "VALIDATION_ERROR", "username is required", "username");
    }
    if (!email) {
      throw new ApiError(400, "VALIDATION_ERROR", "email is required", "email");
    }
    if (!password || password.length < 8) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "password must be at least 8 characters",
        "password"
      );
    }
    if (!full_name) {
      throw new ApiError(400, "VALIDATION_ERROR", "full_name is required", "full_name");
    }

    const pool = await getPool();

    const exists = await pool
      .request()
      .input("username", sql.VarChar(50), username)
      .input("email", sql.VarChar(100), email)
      .query(
        "SELECT user_id FROM Users WHERE username = @username OR email = @email"
      );

    if (exists.recordset.length > 0) {
      throw new ApiError(409, "CONFLICT", "username or email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool
      .request()
      .input("username", sql.VarChar(50), username)
      .input("email", sql.VarChar(100), email)
      .input("password_hash", sql.VarChar(255), passwordHash)
      .input("full_name", sql.VarChar(100), full_name)
      .input("phone_number", sql.VarChar(20), phone_number || null)
      .input("address", sql.VarChar(255), address || null)
      .query(`
        INSERT INTO Users (username, email, password_hash, full_name, phone_number, address)
        OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.email, INSERTED.full_name, INSERTED.phone_number, INSERTED.address
        VALUES (@username, @email, @password_hash, @full_name, @phone_number, @address)
      `);

    const user = result.recordset[0];
    const token = jwt.sign(
      { type: "customer", userId: user.user_id },
      env.jwtSecret,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      data: { token, user },
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      throw new ApiError(400, "VALIDATION_ERROR", "email is required", "email");
    }
    if (!password) {
      throw new ApiError(400, "VALIDATION_ERROR", "password is required", "password");
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", sql.VarChar(100), email)
      .query(`
        SELECT user_id, username, email, password_hash, full_name, phone_number, address
        FROM Users
        WHERE email = @email
      `);

    const user = result.recordset[0];
    if (!user) {
      throw new ApiError(404, "NOT_FOUND", "email not found");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new ApiError(401, "UNAUTHORIZED", "invalid credentials");
    }

    const token = jwt.sign(
      { type: "customer", userId: user.user_id },
      env.jwtSecret,
      { expiresIn: "1d" }
    );

    delete user.password_hash;

    return res.json({
      success: true,
      data: { token, user },
    });
  })
);

module.exports = router;

