import React, { useState } from "react";

const Main = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [executionResult, setExecutionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queryGenerated, setQueryGenerated] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleGenerateSQL = async () => {
    if (!prompt.trim()) {
      alert("Please enter some text.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    try {
      const response = await fetch("http://localhost:5000/generate-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.query);
        setQueryGenerated(true);
        setExecutionResult(null);
      } else {
        setResult(`Error: ${data.details || "Failed to generate query"}`);
        setQueryGenerated(false);
      }
    } catch (error) {
      setResult("Server error. Please try again.");
      setQueryGenerated(false);
    }
    setLoading(false);
  };

  const handleExecuteSQL = async () => {
    if (!result.trim()) {
      alert("No SQL query to execute.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/execute-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: result }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.results && data.results.length > 0) {
          // For queries that return results (SELECT, SHOW, etc.)
          setExecutionResult(data.results);
          setSuccessMessage("");
        } else {
          // For queries that don't return results (CREATE, INSERT, etc.)
          setExecutionResult(null);
          setSuccessMessage(data.message || "Query executed successfully!");
        }
      } else {
        setExecutionResult(null);
        setSuccessMessage(`Error: ${data.details || "Query execution failed"}`);
      }
    } catch (error) {
      setExecutionResult(null);
      setSuccessMessage("Server error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen max-w-full rounded-2xl m-2 p-4 border border-zinc-500">
      {/* Top section with 2 columns */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Input Section */}
        <div className="flex flex-col">
          <label className="block p-1 m-2 text-sm font-medium text-zinc-50">
            Your Prompt (Raw Text)
          </label>
          <textarea
            rows="4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="block p-2 m-2 h-64 w-11/12 text-sm text-gray-900 bg-zinc-200 rounded-lg border"
            placeholder="Enter raw text here..."
          />
          <button
            onClick={handleGenerateSQL}
            disabled={loading}
            className="bg-gradient-to-t from-sky-400 via-sky-400/40 to-100% h-10 w-2/5 min-w-fit p-2 m-2 rounded-lg hover:opacity-80"
          >
            {loading ? "Generating SQL..." : "Generate SQL"}
          </button>
        </div>

        {/* SQL Query Result Section */}
        <div className="flex flex-col">
          <label className="block p-1 m-2 text-sm font-medium text-zinc-50">
            Generated SQL Query
          </label>
          <pre className="p-2 m-2 h-64 w-11/12 text-sm text-gray-900 bg-zinc-200 rounded-lg border overflow-auto">
            {result || "Generated SQL will appear here..."}
          </pre>
          <div className="flex justify-end pr-2 m-2">
            <button
              onClick={handleExecuteSQL}
              className={`h-10 w-3/5 min-w-fit rounded-lg ${
                !queryGenerated
                  ? "bg-zinc-600 opacity-50 cursor-not-allowed"
                  : "bg-gradient-to-t from-sky-400 via-sky-400/40 to-100% hover:opacity-80"
              }`}
              disabled={!queryGenerated || loading}
            >
              {loading ? "Executing..." : "Implement on Database"}
            </button>
          </div>
        </div>
      </div>

      {/* Full width Execution Results Section */}
      <div className="w-full">
        <label className="block p-1 m-2 text-sm font-medium text-zinc-50">
          Execution Results
        </label>
        <div className="p-2 m-2 h-64 w-full text-sm bg-zinc-200 rounded-lg border overflow-auto">
          {successMessage && (
            <div className="text-green-600 p-2">{successMessage}</div>
          )}
          {executionResult ? (
            executionResult.length > 0 ? (
              <table className="w-full text-zinc-950">
                <thead>
                  <tr className="bg-zinc-300">
                    {Object.keys(executionResult[0]).map((key) => (
                      <th key={key} className="p-2 text-left border">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {executionResult.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-zinc-300" : ""}>
                      {Object.values(row).map((value, j) => (
                        <td key={j} className="p-2 border">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-500 italic p-2">
                Query executed successfully but returned no data
              </div>
            )
          ) : (
            !successMessage && (
              <div className="text-gray-500 italic p-2">
                Results will appear here after query execution...
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Main;