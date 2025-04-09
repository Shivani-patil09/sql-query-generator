import { useState, useEffect } from "react";

const Dashboard = () => {
    const [databases, setDatabases] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDb, setSelectedDb] = useState(null);
    const [useDbStatus, setUseDbStatus] = useState(null);
    const [tables, setTables] = useState([]);
    const [tablesLoading, setTablesLoading] = useState(false);
    const [tablesError, setTablesError] = useState(null);

    useEffect(() => {
        const fetchDatabases = async () => {
            try {
                const response = await fetch('http://localhost:5000/execute-sql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: "SHOW DATABASES"
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch databases');
                }

                const data = await response.json();
                setDatabases(data.results.map(db => db.Database));
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchDatabases();
    }, []);

    const fetchTables = async (dbName) => {
        try {
            setTablesLoading(true);
            setTablesError(null);
            
            const response = await fetch('http://localhost:5000/execute-sql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `SHOW TABLES FROM ${dbName}`
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tables');
            }

            const data = await response.json();
            // The table name field varies based on the query, so we get the first property
            const tableField = Object.keys(data.results[0] || {})[0] || 'Tables_in_' + dbName;
            setTables(data.results.map(table => table[tableField]));
            setTablesLoading(false);
        } catch (err) {
            setTablesError(err.message);
            setTablesLoading(false);
        }
    };

    const handleDbSelect = async (dbName) => {
        try {
            setSelectedDb(dbName);
            setUseDbStatus('loading');
            
            const response = await fetch('http://localhost:5000/execute-sql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `USE ${dbName}`
                })
            });

            if (!response.ok) {
                throw new Error('Failed to switch database');
            }

            const data = await response.json();
            setUseDbStatus('success');
            console.log(`Now using database: ${dbName}`, data);
            
            // Fetch tables after successfully switching database
            await fetchTables(dbName);
            
        } catch (err) {
            setUseDbStatus('error');
            console.error(`Error switching to database ${dbName}:`, err);
        }
    };

    if (loading) {
        return <div className="p-4">Loading databases...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4">
            {useDbStatus === 'success' && (
                <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
                    Successfully switched to database: {selectedDb}
                </div>
            )}
            
            {useDbStatus === 'error' && (
                <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
                    Failed to switch to database: {selectedDb}
                </div>
            )}

            <div className="flex flex-wrap">
                {databases.map((dbName, index) => (
                    <div 
                        key={index} 
                        className={`mt-8 ml-8 border border-zinc-500 w-1/5 p-4 rounded-md shadow hover:opacity-80 cursor-pointer transition-opacity
                            ${selectedDb === dbName ? 'bg-blue-400' : 'bg-blue-300'}
                            ${useDbStatus === 'loading' && selectedDb === dbName ? 'animate-pulse' : ''}
                        `}
                        onClick={() => handleDbSelect(dbName)}
                    >
                        <div className="font-semibold">{dbName}</div>
                        {selectedDb === dbName && useDbStatus === 'loading' && (
                            <div className="text-xs mt-1">Switching...</div>
                        )}
                    </div>
                ))}
            </div>

            {selectedDb && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Tables in {selectedDb}</h2>
                    
                    {tablesLoading && <div className="p-4">Loading tables...</div>}
                    
                    {tablesError && (
                        <div className="p-4 text-red-500">Error loading tables: {tablesError}</div>
                    )}
                    
                    {!tablesLoading && !tablesError && (
                        <div className="flex flex-wrap">
                            {tables.length > 0 ? (
                                tables.map((table, index) => (
                                    <div 
                                        key={index} 
                                        className="mt-4 ml-4 border border-zinc-500 w-1/5 p-4 rounded-md shadow hover:opacity-80 cursor-pointer transition-opacity bg-gray-700"
                                    >
                                        <div className="font-semibold">{table}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-gray-500">No tables found in this database</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;