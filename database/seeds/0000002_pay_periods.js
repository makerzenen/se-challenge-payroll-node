exports.seed = function (knex, Promise) {
  return knex("pay_periods").insert([
    {
      start_date: "2020-01-01",
      end_date: "2020-01-15",
    },
    {
      start_date: "2020-01-16",
      end_date: "2020-01-31",
    },
    {
      start_date: "2020-02-01",
      end_date: "2020-02-15",
    },
    {
      start_date: "2020-02-16",
      end_date: "2020-02-28",
    },
    {
      start_date: "2020-03-01",
      end_date: "2020-03-15",
    },
    {
      start_date: "2020-03-16",
      end_date: "2020-03-31",
    },
    {
      start_date: "2020-04-01",
      end_date: "2020-04-15",
    },
    {
      start_date: "2020-04-16",
      end_date: "2020-04-30",
    },
    {
      start_date: "2020-05-01",
      end_date: "2020-05-15",
    },
    {
      start_date: "2020-05-16",
      end_date: "2020-05-31",
    },
    {
      start_date: "2020-06-01",
      end_date: "2020-06-15",
    },
    {
      start_date: "2020-06-16",
      end_date: "2020-06-30",
    },
    {
      start_date: "2020-07-01",
      end_date: "2020-07-15",
    },
    {
      start_date: "2020-07-16",
      end_date: "2020-01-31",
    },
    {
      start_date: "2020-08-01",
      end_date: "2020-08-15",
    },
    {
      start_date: "2020-08-16",
      end_date: "2020-08-31",
    },
    {
      start_date: "2020-09-01",
      end_date: "2020-09-15",
    },
    {
      start_date: "2020-09-16",
      end_date: "2020-09-30",
    },
    {
      start_date: "2020-10-01",
      end_date: "2020-10-15",
    },
    {
      start_date: "2020-10-16",
      end_date: "2020-10-31",
    },
    {
      start_date: "2020-11-01",
      end_date: "2020-11-15",
    },
    {
      start_date: "2020-11-16",
      end_date: "2020-11-30",
    },
    {
      start_date: "2020-12-01",
      end_date: "2020-12-15",
    },
    {
      start_date: "2020-12-16",
      end_date: "2020-12-31",
    },
  ]);
};
