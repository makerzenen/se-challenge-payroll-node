exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable("time_reports", function (table) {
      table.increments("id");
      table.integer("public_id").unique().notNullable();
      table.string("status").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("employees", function (table) {
      table.increments("id");
      table.integer("public_id").unique().notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("job_groups", function (table) {
      table.increments("id");
      table.string("public_id").unique().notNullable();
      table.decimal("hourly_pay", 8).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("payroll", function (table) {
      table.increments("id");
      table
        .integer("employee_id")
        .references("id")
        .inTable("employees")
        .notNull();
      table
        .integer("time_report_id")
        .references("id")
        .inTable("time_reports")
        .notNull();
      table
        .integer("job_group_id")
        .references("id")
        .inTable("job_groups")
        .notNull();
      table.decimal("hours_worked", 8).notNullable();
      table.decimal("pay_amount", 8).notNullable();
      table.date("work_date").notNullable();
      table.date("pay_period_start_date").notNullable();
      table.date("pay_period_end_date").notNullable();
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
