class ApiError extends Error {
  constructor(statusCode, code, message, field = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
  }
}

module.exports = ApiError;

