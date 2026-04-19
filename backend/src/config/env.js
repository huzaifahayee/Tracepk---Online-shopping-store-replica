const dotenv = require("dotenv");

dotenv.config();

const dbAuthMode = (process.env.DB_AUTH_MODE || "sql").toLowerCase();

const baseRequired = ["DB_SERVER", "DB_NAME", "JWT_SECRET"];
const sqlModeRequired = ["DB_USER", "DB_PASSWORD"];

baseRequired.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
});

if (dbAuthMode === "sql") {
  sqlModeRequired.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required env var for sql auth: ${key}`);
    }
  });
}

if (!["sql", "windows"].includes(dbAuthMode)) {
  throw new Error("DB_AUTH_MODE must be either 'sql' or 'windows'");
}

module.exports = {
  port: Number(process.env.PORT || 5000),
  dbAuthMode,
  dbServer: process.env.DB_SERVER,
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbOdbcDriver: process.env.DB_ODBC_DRIVER || "ODBC Driver 18 for SQL Server",
  jwtSecret: process.env.JWT_SECRET,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};
