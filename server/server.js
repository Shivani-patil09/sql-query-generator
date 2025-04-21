const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store multiple connection pools for different databases
const connectionPools = {};

// Default connection configuration
const DEFAULT_CONNECTION = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: null // Will be set when a database is selected
};

// Function to establish a connection
const createConnection = (config, callback) => {
  const connectionKey = `${config.host}-${config.user}-${config.database || 'default'}`;
  
  // If pool already exists, return it
  if (connectionPools[connectionKey]) {
    return callback(null, connectionPools[connectionKey]);
  }

  // Create new connection pool
  const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Test the connection
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection failed:", err.message);
      delete connectionPools[connectionKey];
      return callback(err);
    }
    
    console.log(`Connected to ${config.database ? `database: ${config.database}` : 'MySQL server'}`);
    connection.release();
    connectionPools[connectionKey] = pool;
    callback(null, pool);
  });
};

// Start the server and automatically connect
const server = app.listen(5001, () => {
  console.log("Server running on port 5001");
  
  // Automatically connect to default database
  createConnection(DEFAULT_CONNECTION, (err) => {
    if (err) {
      console.error("Automatic connection failed:", err.message);
    } else {
      console.log("Automatically connected to default MySQL server");
    }
  });
});


// API Endpoints

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
      - If the input is an SQL schema or DDL statement, analyze the schema and generate appropriate queries based on potential requirements.
      
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
  
  // Use default values if not provided
  const connectionConfig = {
    host: host || DEFAULT_CONNECTION.host,
    user: user || DEFAULT_CONNECTION.user,
    password: password || DEFAULT_CONNECTION.password,
    database: database || null
  };

  createConnection(connectionConfig, (err, pool) => {
    if (err) {
      return res.status(500).json({ 
        error: "Database connection failed", 
        details: err.message 
      });
    }
    
    res.json({ 
      message: "Connected successfully",
      database: connectionConfig.database || 'default'
    });
  });
});

app.post("/change-database", (req, res) => {
  const { host, user, password, database } = req.body;
  
  if (!database) {
    return res.status(400).json({ error: "Database name is required" });
  }

  // Use default values if not provided
  const connectionConfig = {
    host: host || DEFAULT_CONNECTION.host,
    user: user || DEFAULT_CONNECTION.user,
    password: password || DEFAULT_CONNECTION.password,
    database: database
  };

  createConnection(connectionConfig, (err, pool) => {
    if (err) {
      return res.status(500).json({ 
        error: `Failed to switch to database: ${database}`,
        details: err.message 
      });
    }
    
    res.json({ 
      message: `Switched to database: ${database}`,
      database 
    });
  });
});

app.post("/execute-sql", async (req, res) => {
  const { query, host, user, password, database } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: "No SQL query provided" });
  }

  // Use default values if not provided
  const connectionKey = `${host || DEFAULT_CONNECTION.host}-${user || DEFAULT_CONNECTION.user}-${database || 'default'}`;
  const pool = connectionPools[connectionKey];

  if (!pool) {
    return res.status(400).json({
      error: "Database not connected",
      message: "Please connect to the database first using the /connect endpoint"
    });
  }

  try {
    const results = await pool.promise().query(query);
    const queryResult = results[0];
    res.json({ 
      message: "Query executed successfully", 
      results: queryResult,
      database: database || 'default'
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Query execution failed", 
      details: error.message 
    });
  }
});

app.get("/tables", async (req, res) => {
  const { host, user, password, database } = req.query;
  
  if (!database) {
    return res.status(400).json({ error: "Database name is required" });
  }

  // Use default values if not provided
  const connectionKey = `${host || DEFAULT_CONNECTION.host}-${user || DEFAULT_CONNECTION.user}-${database}`;
  const pool = connectionPools[connectionKey];

  if (!pool) {
    return res.status(400).json({
      error: "Database not connected",
      message: "Please connect to the database first using the /connect endpoint"
    });
  }

  try {
    const [results] = await pool.promise().query("SHOW TABLES");
    res.json({ 
      message: "Tables retrieved successfully", 
      results,
      database 
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Table retrieval failed", 
      details: error.message 
    });
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});