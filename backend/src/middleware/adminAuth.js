const jwt = require("jsonwebtoken");
const env = require("../config/env");
const ApiError = require("../utils/apiError");

function requireAdminAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");

  if (!token) {
    return next(new ApiError(401, "UNAUTHORIZED", "Missing auth token"));
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (decoded.type !== "admin") {
      throw new ApiError(403, "FORBIDDEN", "Invalid token scope");
    }
    req.admin = { adminId: decoded.adminId };
    return next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
}

module.exports = { requireAdminAuth };
