const express = require("express");
const { getPool, sql } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAdminAuth } = require("../middleware/adminAuth");

const router = express.Router();

// Public route to get settings (used for announcement bar)
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT setting_key, setting_value
      FROM Settings
    `);

    const settings = {};
    result.recordset.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    return res.json({ success: true, data: settings });
  })
);

// Admin route to update settings
router.put(
  "/",
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const settingsUpdates = req.body; // object of key: value
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();
    try {
      for (const [key, value] of Object.entries(settingsUpdates)) {
        await new sql.Request(transaction)
          .input("key", sql.VarChar(50), key)
          .input("value", sql.VarChar(500), value || "")
          .query(`
            IF EXISTS(SELECT 1 FROM Settings WHERE setting_key = @key)
              UPDATE Settings SET setting_value = @value WHERE setting_key = @key
            ELSE
              INSERT INTO Settings (setting_key, setting_value) VALUES (@key, @value)
          `);
      }
      await transaction.commit();
      return res.json({ success: true, message: "Settings updated successfully" });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  })
);

module.exports = router;
