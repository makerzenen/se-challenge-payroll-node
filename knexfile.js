if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const knex = require("knex")({
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
});

module.exports = knex;
