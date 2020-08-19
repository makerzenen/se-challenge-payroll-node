exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable("time_reports", function (table) {
      table.increments("id");
      table.number("public_id").unique().notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("employees", function (table) {
      table.increments("id");
      table.number("public_id").unique().notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("job_groups", function (table) {
      table.increments("id");
      table.string("public_id").unique().notNullable();
      table.number("hourly_pay").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("payroll", function (table) {
      table.increments("id");
      table
        .specificType("employee_id", "employee_id")
        .notNullable()
        .references("id")
        .inTable("employees");
      table
        .specificType("time_report_id", "time_report_id")
        .notNullable()
        .references("id")
        .inTable("time_reports");
      table
        .specificType("job_group_id", "job_group_id")
        .notNullable()
        .references("id")
        .inTable("job_group");
      table.number("hours_worked").notNullable();
      table.date("work_date").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable("payroll"),
    knex.schema.dropTable("job_groups"),
    knex.schema.dropTable("employees"),
    knex.schema.dropTable("time_reports"),
  ]);
};
