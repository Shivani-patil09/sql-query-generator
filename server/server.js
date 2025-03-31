const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
// const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let pool;

app.post("/generate-sql", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "No input provided" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(`
      You are an expert SQL developer. The user has provided an input, which may be:
      1. A natural language task that describes a query requirement.
      2. An SQL schema or DDL (Data Definition Language) statement, which may require generating sample queries, modifying the schema, or performing a specific task.
      
      **User Input:**
      ${prompt}
      
      **Task Instructions:**
      - If the input is a natural language description, generate a fully executable SQL query that fulfills the task for a MySQL database.
      - If the input is an SQL schema or DDL statement, analyze the schema and generate appropriate queries based on potential requirements. For example:
        - If the task asks for sample queries, generate SELECT, INSERT, UPDATE, or DELETE statements.
        - If modification or additional columns are required, generate the appropriate ALTER TABLE statements.
      - If the input is of the type add a random user in table users it has id name and age just add id 1 name john age 20
      
      **Output Format:**
      - Return only the SQL query, properly formatted and ready for execution in MySQL.
      - Ensure the query is valid and follows MySQL syntax.
      - Avoid explanations unless explicitly requested.
      `);

    const response = await result.response;

    const sqlQuery =
      response.text().replace(/```sql|```/g, "") ||
      "Failed to generate SQL query";
    console.log("SQL Query:", sqlQuery);

    res.json({ query: sqlQuery });
  } catch (error) {
    console.error("Error generating SQL:", error);
    res.status(500).json({
      error: "Failed to generate SQL",
      details: error.message,
    });
  }
});

app.post("/connect", (req, res) => {
  const { host, user, password, database } = req.body;
  pool = mysql.createPool({
    host,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection failed:", err.message);
      return res
        .status(500)
        .json({ error: "Database connection failed", details: err.message });
    } else {
      console.log("Connected to the database!");
      connection.query(
        "create table if not exists users (id int, name varchar(255), age int)"
      );
      res.json({ message: "Connected successfully" });
    }
  });
});

app.post("/execute-sql", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "No SQL query provided" });
  }
  try {
    if (!pool) {
      return res.status(400).json({
        error: "Database not connected",
        message:
          "Please connect to a database first using the /connect endpoint",
      });
    }
    const results = await pool.promise().query(query);
    const queryResult = results[0];
    res.json({ message: "Query executed successfully", results: queryResult });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Query execution failed", details: error.message });
  }
});

app.get("/tables", async (req, res) => {
  try {
    if (!pool) {
      return res.status(400).json({
        error: "Database not connected",
        message:
          "Please connect to a database first using the /connect endpoint",
      });
    }
    const [results] = await pool.promise().query("SHOW TABLES");
    res.json({ message: "Tables retrieved successfully", results });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Table retrieval failed", details: error.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
