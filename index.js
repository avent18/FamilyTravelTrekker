/** @format */

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config'

const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((codes) => {
    countries.push(codes.country_code);
  });
  return countries;
}

app.get("/", async (req, res) => {
  let countries = await checkVisited();
  res.render("index.ejs", { countries: countries, total: countries.length });
  db.end();
});

app.post("/add", async (req, res) => {
  const input = req.body.country;

  const response = await db.query(
    "SELECT country_code FROM COUNTIES WHERE countyr_name = $1",
    [input]
  );

  if (response.rows.length !== 0) {
    const data = response.rows[0];
    const countryCode = data.country_code;

    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [
      countryCode,
    ]);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
