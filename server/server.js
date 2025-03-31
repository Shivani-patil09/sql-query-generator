const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(bodyParser.json());
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let pool;

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

  pool.getConnection((err) => {
    if (err) {
      res.status(500).json({ error: "Database connection failed", details: err.message });
    } else {
      res.json({ message: "Connected successfully" });
    }
  });
});

app.post("/generate-sql", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "No input provided" });

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      const result = await model.generateContent(`Convert this to an SQL query: ${prompt}`);
      const response = await result.response;
      
      const sqlQuery = response.text() || "Failed to generate SQL query";

      res.json({ query: sqlQuery });
    } catch (error) {
        console.error("Error generating SQL:", error);
        res.status(500).json({ 
          error: "Failed to generate SQL", 
          details: error.message 
        });
    }
});

// Execute SQL Query
app.post("/execute-sql", (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: "No SQL query provided" });
  }

  pool.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Query execution failed", details: error.message });
    }
    res.json({ message: "Query executed successfully", results });
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
