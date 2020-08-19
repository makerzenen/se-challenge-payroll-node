exports.seed = function (knex, Promise) {
  return knex("job_groups").insert([
    {
      public_id: "A",
      hourly_pay: 20,
    },
    {
      public_id: "B",
      hourly_pay: 30,
    },
  ]);
};
