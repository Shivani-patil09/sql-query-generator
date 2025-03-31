import React, { useState } from "react";

const Main = () => {
    const [prompt, setPrompt] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [queryGenerated, setQueryGenerated] = useState(false);

    // Convert raw text to SQL query
    const handleGenerateSQL = async () => {
        if (!prompt.trim()) {
            alert("Please enter some text.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/generate-sql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }), // Corrected field name
            });

            const data = await response.json();
            if (response.ok) {
                setResult(data.query); // Display generated SQL
                setQueryGenerated(true); // Enable "Implement" button
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

    // Execute the generated SQL query on the database
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
                alert("Query executed successfully!");
            } else {
                alert(`Execution failed: ${data.details || "Unknown error"}`);
            }
        } catch (error) {
            alert("Server error. Please try again.");
        }
        setLoading(false);
    };
    
    return (
        <div className="grid grid-cols-2 border border-zinc-500 min-h-screen max-w-full rounded-2xl m-2 p-4">    
            {/* Input Section */}
            <div className="flex flex-col">
                <label htmlFor="message" className="block p-1 m-2 text-sm font-medium text-zinc-50 dark:text-white">
                    Your Prompt (Raw Text)
                </label>
                <textarea 
                    id="message" 
                    rows="4" 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    className="block p-2 m-2 h-1/3 w-11/12 text-sm text-gray-900 bg-zinc-200 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                    placeholder="Enter raw text here..."
                />
                <button 
                    onClick={handleGenerateSQL}
                    disabled={loading}
                    className="bg-gradient-to-t from-sky-400 via-45% via-sky-400/40 to-100% h-10 w-2/5 min-w-fit p-2 m-2 rounded-lg hover:bg-gradient-to-b from-sky-400 via-45% via-sky-400/40 to-100% border-sky-900 border-2 hover:opacity-80"
                >
                    {loading ? "Generating SQL..." : "Generate SQL"}
                </button>
            </div>

            {/* Result Section */}
            <div className="flex flex-col">
                <label htmlFor="result" className="block p-1 m-2 text-sm font-medium text-zinc-50 dark:text-white">
                    Generated SQL Query
                </label>
                <pre 
                    id="result" 
                    className="p-2 m-2 h-1/3 w-11/12 text-sm text-gray-900 bg-zinc-200 rounded-lg border"
                >
                    {result || "Generated SQL will appear here..."}
                </pre>
                <div className="flex justify-end pr-2 m-2">
                    <button
                        onClick={handleExecuteSQL}
                        className={`h-10 w-3/5 min-w-fit rounded-lg ${
                            !queryGenerated ? 'bg-zinc-600 opacity-50 cursor-not-allowed' : "bg-gradient-to-t from-sky-400 via-45% via-sky-400/40 to-100% hover:bg-gradient-to-b from-sky-400 via-45% via-sky-400/40 to-100% border-sky-900 border-2 hover:opacity-80"
                        }`}
                        disabled={!queryGenerated}
                    >
                        Implement on Database
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Main;
