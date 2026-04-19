-- Migration: Add is_disabled column to Users table
-- This enables soft-delete (account disable) without losing order history.
-- Run this once in SSMS against the OnlineClothingBrand database.

USE OnlineClothingBrand;

IF COL_LENGTH('Users', 'is_disabled') IS NULL
BEGIN
    ALTER TABLE Users ADD is_disabled BIT NOT NULL DEFAULT 0;
    PRINT 'Column is_disabled added to Users table.';
END
ELSE
BEGIN
    PRINT 'Column is_disabled already exists on Users table.';
END
