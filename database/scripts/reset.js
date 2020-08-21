const knex = require("knex"),
  spawn = require("cross-spawn");
const config = require("../../knexfile.js"),
  logger = require("../../logger.js");

async function reset() {
  if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  const db = knex({
    ...config,
    connection: { ...config.connection, database: "postgres" },
  });

  // Drop existing connections to database.
  await db.raw(
    ` SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = ? AND pid <> pg_backend_pid()`,
    [process.env.DATABASE_NAME],
  );

  // Drop and recreate the database
  await db.raw(`DROP DATABASE IF EXISTS ??`, [process.env.DATABASE_NAME]);
  await db.raw(`CREATE DATABASE ??`, [process.env.DATABASE_NAME]);
  await db.destroy();

  // Migrate database to the latest version
  spawn.sync("yarn", ["knex", "migrate:latest"], { stdio: "inherit" });
  spawn.sync("yarn", ["knex", "seed:run"], { stdio: "inherit" });
}

reset().catch((err) => {
  logger.error(err);
  process.exit(1);
});
