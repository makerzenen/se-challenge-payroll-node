if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

config = {
  debug: process.env.NODE_ENV === "development" || false,
  client: "postgres",
  connection: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  migrations: {
    tableName: "knex_migrations",
  },
  migrations: { directory: "database/migrations" },
  seeds: { directory: "database/seeds" },
};

module.exports = config;
