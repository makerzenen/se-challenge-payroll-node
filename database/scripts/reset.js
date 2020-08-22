#! /usr/bin/env node
const logger = require("../../logger.js"),
  knex = require("../../knexfile.js");

async function reset(db) {
  // Drop existing connections to database.
  await db.raw(
    ` SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = ? AND pid <> pg_backend_pid()`,
    [process.env.DATABASE_NAME],
  );

  // Drop and recreate the database.
  await db.raw(`DROP DATABASE IF EXISTS ??`, [process.env.DATABASE_NAME]);
  await db.raw(`CREATE DATABASE ??`, [process.env.DATABASE_NAME]);
  await db.destroy();

  // Recreate database connection to newly created database.
  knex.connection.database = process.env.DATABASE_NAME;
  db = require("knex")(knex);

  // Migrate database to the latest version and run seeds.
  await db.migrate.latest().then(() => {
    return db.seed.run();
  });
  await db.destroy();
}

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

knex.connection.database = "postgres";
db = require("knex")(knex);

reset(db).catch((err) => {
  logger.error(err);
  process.exit(1);
});
