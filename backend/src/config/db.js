const env = require("./env");

let sql;
let dbConfig;

if (env.dbAuthMode === "windows") {
  try {
    sql = require("mssql/msnodesqlv8");
  } catch (error) {
    throw new Error(
      "Windows DB auth requires 'msnodesqlv8'. Run: npm install msnodesqlv8"
    );
  }

  dbConfig = {
    connectionString: `Driver={${env.dbOdbcDriver}};Server=${env.dbServer};Database=${env.dbName};Trusted_Connection=Yes;TrustServerCertificate=Yes;Encrypt=No;`,
    server: env.dbServer,
    database: env.dbName,
    driver: "msnodesqlv8",
    options: {
      trustedConnection: true,
      trustServerCertificate: true,
      encrypt: false,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
} else {
  sql = require("mssql");
  dbConfig = {
    user: env.dbUser,
    password: env.dbPassword,
    server: env.dbServer,
    database: env.dbName,
    options: {
      trustServerCertificate: true,
      encrypt: false,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((pool) => pool);
  }
  return poolPromise;
}

module.exports = { sql, getPool };
