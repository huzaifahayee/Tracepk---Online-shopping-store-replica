function notFound(req, res) {
  return res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;

  if (statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Something went wrong",
      ...(err.field ? { field: err.field } : {}),
    },
  });
}

module.exports = { notFound, errorHandler };

