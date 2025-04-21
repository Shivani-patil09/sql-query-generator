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
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-white">Database Explorer</h1>
                <p className="text-zinc-400">Select a database to view its tables</p>
            </div>
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
                        className={`mt-8 ml-8 border w-1/5 p-4 rounded-md shadow hover:opacity-80 cursor-pointer transition-opacity flex items-center
                            ${selectedDb === dbName ? 'bg-gradient-to-t from-sky-400 via-45% via-sky-400/40 to-100% border-t border-r border-white' : 'bg-gradient-to-t from-sky-400 via-45% via-sky-400/40 to-100% border-zinc-500'}
                            ${useDbStatus === 'loading' && selectedDb === dbName ? 'animate-pulse' : ''}
                        `}
                        onClick={() => handleDbSelect(dbName)}
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                                    <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                                    <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                                </svg>
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
                                        className="mt-4 ml-4 border border-zinc-500 w-1/5 p-4 rounded-md shadow hover:opacity-80 cursor-pointer transition-opacity bg-gray-700 flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                                        </svg>
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