// SQLPlayground.js - Main SQL Playground component

// Our SQL engine class for executing queries
class SimpleSQL {
    constructor() {
      this.databases = {
        employees: [
          { id: 1, name: 'John Doe', department: 'Engineering', salary: 85000 },
          { id: 2, name: 'Jane Smith', department: 'Marketing', salary: 75000 },
          { id: 3, name: 'Bob Johnson', department: 'Engineering', salary: 90000 },
          { id: 4, name: 'Alice Brown', department: 'HR', salary: 65000 },
          { id: 5, name: 'Charlie Wilson', department: 'Marketing', salary: 80000 }
        ],
        departments: [
          { id: 1, name: 'Engineering', budget: 500000 },
          { id: 2, name: 'Marketing', budget: 300000 },
          { id: 3, name: 'HR', budget: 200000 }
        ],
        projects: [
          { id: 1, name: 'Website Redesign', department_id: 2, status: 'In Progress', budget: 50000 },
          { id: 2, name: 'Mobile App', department_id: 1, status: 'Completed', budget: 120000 },
          { id: 3, name: 'Database Migration', department_id: 1, status: 'Planning', budget: 75000 },
          { id: 4, name: 'Recruitment Campaign', department_id: 3, status: 'In Progress', budget: 30000 }
        ]
      };
    }
    
    executeQuery(query) {
      query = query.trim();
      const lowerQuery = query.toLowerCase();
      
      if (lowerQuery.startsWith('select')) {
        return this.parseSelectQuery(query);
      } else if (lowerQuery.startsWith('insert into')) {
        return this.parseInsertQuery(query);
      } else if (lowerQuery.startsWith('update')) {
        return this.parseUpdateQuery(query);
      } else if (lowerQuery.startsWith('delete from')) {
        return this.parseDeleteQuery(query);
      } else {
        return { error: 'Only SELECT, INSERT, UPDATE, and DELETE queries are supported in this demo' };
      }
    }
    
    parseSelectQuery(query) {
      try {
        const lowerQuery = query.toLowerCase();
        
        // Basic parsing - this is simplified and not fully SQL compliant
        let matches = lowerQuery.match(/select\s+(.*?)\s+from\s+(\w+)(?:\s+where\s+(.*))?(?:\s+order by\s+(.*))?(?:\s+limit\s+(\d+))?/i);
        
        if (!matches) {
          return { error: 'Invalid SELECT query format' };
        }
        
        const columns = matches[1].split(',').map(col => col.trim());
        const tableName = matches[2];
        const whereClause = matches[3];
        const orderBy = matches[4];
        const limit = matches[5] ? parseInt(matches[5]) : null;
        
        if (!this.databases[tableName]) {
          return { error: `Table ${tableName} not found` };
        }
        
        // Start with all records
        let result = [...this.databases[tableName]];
        
        // Apply WHERE filtering (basic implementation)
        if (whereClause) {
          // Parse the WHERE clause - support basic operations
          if (whereClause.includes('=')) {
            const parts = whereClause.split('=').map(p => p.trim());
            if (parts.length === 2) {
              const field = parts[0];
              let value = parts[1];
              
              // Remove quotes from string values
              if ((value.startsWith("'") && value.endsWith("'")) || 
                  (value.startsWith('"') && value.endsWith('"'))) {
                value = value.substring(1, value.length - 1);
              } else {
                // Try to parse as number
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                  value = numValue;
                }
              }
              
              result = result.filter(row => row[field] == value);
            }
          }
        }
        
        // Apply ORDER BY (simple implementation)
        if (orderBy) {
          const orderParts = orderBy.split(' ');
          const field = orderParts[0];
          const isDesc = orderParts.length > 1 && orderParts[1].toLowerCase() === 'desc';
          
          result.sort((a, b) => {
            if (a[field] < b[field]) return isDesc ? 1 : -1;
            if (a[field] > b[field]) return isDesc ? -1 : 1;
            return 0;
          });
        }
        
        // Apply LIMIT
        if (limit !== null) {
          result = result.slice(0, limit);
        }
        
        // Select specific columns if not *
        if (columns.length === 1 && columns[0] === '*') {
          return { success: true, rows: result, count: result.length };
        } else {
          return { 
            success: true,
            rows: result.map(row => {
              const newRow = {};
              columns.forEach(col => {
                newRow[col] = row[col];
              });
              return newRow;
            }),
            count: result.length
          };
        }
      } catch (e) {
        return { error: `Error parsing SELECT query: ${e.message}` };
      }
    }
    
    parseInsertQuery(query) {
      try {
        // Basic INSERT parser
        const matches = query.match(/insert into (\w+)\s+values\s*\((.*)\)/i);
        
        if (!matches) {
          return { error: 'Invalid INSERT query format' };
        }
        
        const tableName = matches[1];
        const valueString = matches[2];
        
        if (!this.databases[tableName]) {
          return { error: `Table ${tableName} not found` };
        }
        
        // Parse values (simplified)
        const values = [];
        let currentValue = '';
        let inQuotes = false;
        let quoteChar = null;
        
        for (let i = 0; i < valueString.length; i++) {
          const char = valueString[i];
          
          if ((char === "'" || char === '"') && (!inQuotes || quoteChar === char)) {
            inQuotes = !inQuotes;
            if (inQuotes) quoteChar = char;
            else quoteChar = null;
            currentValue += char;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // Add the last value
        if (currentValue) {
          values.push(currentValue.trim());
        }
        
        // Process values to convert strings and numbers
        const processedValues = values.map(val => {
          const trimmed = val.trim();
          if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || 
              (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
            return trimmed.substring(1, trimmed.length - 1); // String
          } else {
            const numValue = Number(trimmed);
            return isNaN(numValue) ? trimmed : numValue; // Number or as-is
          }
        });
        
        // Get column names
        const columns = Object.keys(this.databases[tableName][0]);
        
        if (processedValues.length !== columns.length) {
          return { error: `Value count (${processedValues.length}) does not match column count (${columns.length}) for table ${tableName}` };
        }
        
        // Create new row
        const newRow = {};
        columns.forEach((col, index) => {
          newRow[col] = processedValues[index];
        });
        
        // Add to database
        this.databases[tableName].push(newRow);
        
        return { 
          success: true,
          message: 'Insert successful', 
          affectedRows: 1, 
          lastInsertId: newRow.id 
        };
      } catch (e) {
        return { error: `Error parsing INSERT query: ${e.message}` };
      }
    }
    
    parseUpdateQuery(query) {
      try {
        // Basic UPDATE parser
        const matches = query.match(/update\s+(\w+)\s+set\s+(.+?)(?:\s+where\s+(.+))?$/i);
        
        if (!matches) {
          return { error: 'Invalid UPDATE query format' };
        }
        
        const tableName = matches[1];
        const setClause = matches[2];
        const whereClause = matches[3];
        
        if (!this.databases[tableName]) {
          return { error: `Table ${tableName} not found` };
        }
        
        // Parse SET assignments
        const assignments = {};
        const setParts = setClause.split(',');
        
        for (const part of setParts) {
          const [field, valueStr] = part.split('=').map(p => p.trim());
          let value = valueStr;
          
          // Parse value
          if ((value.startsWith("'") && value.endsWith("'")) || 
              (value.startsWith('"') && value.endsWith('"'))) {
            value = value.substring(1, value.length - 1); // String
          } else {
            const numValue = Number(value);
            value = isNaN(numValue) ? value : numValue; // Number or as-is
          }
          
          assignments[field] = value;
        }
        
        // Find rows to update
        let rowsToUpdate = [...this.databases[tableName]];
        
        // Apply WHERE clause if it exists
        if (whereClause) {
          const whereParts = whereClause.split('=').map(p => p.trim());
          if (whereParts.length === 2) {
            const field = whereParts[0];
            let value = whereParts[1];
            
            // Remove quotes from string values
            if ((value.startsWith("'") && value.endsWith("'")) || 
                (value.startsWith('"') && value.endsWith('"'))) {
              value = value.substring(1, value.length - 1);
            } else {
              const numValue = Number(value);
              if (!isNaN(numValue)) {
                value = numValue;
              }
            }
            
            rowsToUpdate = rowsToUpdate.filter(row => row[field] == value);
          }
        }
        
        // Update the rows
        const rowIndices = rowsToUpdate.map(row => 
          this.databases[tableName].findIndex(r => r === row)
        );
        
        rowIndices.forEach(index => {
          if (index !== -1) {
            for (const [field, value] of Object.entries(assignments)) {
              this.databases[tableName][index][field] = value;
            }
          }
        });
        
        return {
          success: true,
          message: 'Update successful',
          affectedRows: rowsToUpdate.length
        };
      } catch (e) {
        return { error: `Error parsing UPDATE query: ${e.message}` };
      }
    }
    
    parseDeleteQuery(query) {
      try {
        // Basic DELETE parser
        const matches = query.match(/delete from\s+(\w+)(?:\s+where\s+(.+))?$/i);
        
        if (!matches) {
          return { error: 'Invalid DELETE query format' };
        }
        
        const tableName = matches[1];
        const whereClause = matches[2];
        
        if (!this.databases[tableName]) {
          return { error: `Table ${tableName} not found` };
        }
        
        // Find rows to delete
        let rowsToDelete = [...this.databases[tableName]];
        
        // Apply WHERE clause if it exists
        if (whereClause) {
          const whereParts = whereClause.split('=').map(p => p.trim());
          if (whereParts.length === 2) {
            const field = whereParts[0];
            let value = whereParts[1];
            
            // Remove quotes from string values
            if ((value.startsWith("'") && value.endsWith("'")) || 
                (value.startsWith('"') && value.endsWith('"'))) {
              value = value.substring(1, value.length - 1);
            } else {
              const numValue = Number(value);
              if (!isNaN(numValue)) {
                value = numValue;
              }
            }
            
            rowsToDelete = rowsToDelete.filter(row => row[field] == value);
          }
        }
        
        // Delete the rows
        const rowIndices = rowsToDelete.map(row => 
          this.databases[tableName].findIndex(r => r === row)
        ).sort((a, b) => b - a); // Sort in descending order to remove from end first
        
        rowIndices.forEach(index => {
          if (index !== -1) {
            this.databases[tableName].splice(index, 1);
          }
        });
        
        return {
          success: true,
          message: 'Delete successful',
          affectedRows: rowsToDelete.length
        };
      } catch (e) {
        return { error: `Error parsing DELETE query: ${e.message}` };
      }
    }
    
    explainQuery(query) {
      query = query.trim().toLowerCase();
      
      if (query.startsWith("select")) {
        let explanation = "This query retrieves data";
        
        // Check for specific table
        const tableMatch = query.match(/from\s+(\w+)/i);
        if (tableMatch) {
          explanation += ` from the '${tableMatch[1]}' table`;
        }
        
        // Check for specific columns
        const columnsMatch = query.match(/select\s+(.*?)\s+from/i);
        if (columnsMatch && !columnsMatch[1].includes('*')) {
          const columns = columnsMatch[1].split(',').map(c => c.trim());
          if (columns.length <= 3) {
            explanation += ` showing the ${columns.join(', ')} column${columns.length > 1 ? 's' : ''}`;
          } else {
            explanation += ` showing ${columns.length} specific columns`;
          }
        }
        
        // Check for WHERE clause
        if (query.includes("where")) {
          explanation += " with specific conditions";
          
          // Try to explain the condition
          const whereMatch = query.match(/where\s+(.*?)(?:\s+order|\s+limit|$)/i);
          if (whereMatch) {
            const condition = whereMatch[1];
            if (condition.includes('=')) {
              const [field, value] = condition.split('=').map(p => p.trim());
              explanation += ` (where ${field} equals ${value})`;
            }
          }
        }
        
        // Check for ORDER BY
        if (query.includes("order by")) {
          const orderMatch = query.match(/order by\s+(.*?)(?:\s+limit|$)/i);
          if (orderMatch) {
            const orderParts = orderMatch[1].split(' ');
            const field = orderParts[0];
            const direction = orderParts.length > 1 && orderParts[1].toLowerCase() === 'desc' ? 'descending' : 'ascending';
            explanation += ` sorted by ${field} in ${direction} order`;
          } else {
            explanation += " and sorts the results";
          }
        }
        
        // Check for LIMIT
        if (query.includes("limit")) {
          const limitMatch = query.match(/limit\s+(\d+)/i);
          if (limitMatch) {
            explanation += ` showing at most ${limitMatch[1]} result${parseInt(limitMatch[1]) !== 1 ? 's' : ''}`;
          } else {
            explanation += " with a limit on the number of results";
          }
        }
        
        return explanation + ".";
      } else if (query.startsWith("insert")) {
        const tableMatch = query.match(/into\s+(\w+)/i);
        return `This query adds a new record to the '${tableMatch ? tableMatch[1] : "specified"}' table.`;
      } else if (query.startsWith("update")) {
        let explanation = "This query modifies";
        
        const tableMatch = query.match(/update\s+(\w+)/i);
        if (tableMatch) {
          explanation += ` data in the '${tableMatch[1]}' table`;
        } else {
          explanation += " existing data";
        }
        
        // Check for WHERE clause
        if (query.includes("where")) {
          explanation += " for specific records";
          
          // Try to explain the condition
          const whereMatch = query.match(/where\s+(.*?)$/i);
          if (whereMatch) {
            const condition = whereMatch[1];
            if (condition.includes('=')) {
              const [field, value] = condition.split('=').map(p => p.trim());
              explanation += ` (where ${field} equals ${value})`;
            }
          }
        } else {
          explanation += " for all records";
        }
        
        return explanation + ".";
      } else if (query.startsWith("delete")) {
        let explanation = "This query removes";
        
        const tableMatch = query.match(/from\s+(\w+)/i);
        if (tableMatch) {
          explanation += ` data from the '${tableMatch[1]}' table`;
        } else {
          explanation += " data";
        }
        
        // Check for WHERE clause
        if (query.includes("where")) {
          explanation += " for specific records";
          
          // Try to explain the condition
          const whereMatch = query.match(/where\s+(.*?)$/i);
          if (whereMatch) {
            const condition = whereMatch[1];
            if (condition.includes('=')) {
              const [field, value] = condition.split('=').map(p => p.trim());
              explanation += ` (where ${field} equals ${value})`;
            }
          }
        } else {
          explanation += " for all records";
        }
        
        return explanation + ".";
      } else {
        return "This query performs a database operation.";
      }
    }
    
    // Get schema information for a table or all tables
    getSchema(tableName = null) {
      if (tableName && this.databases[tableName]) {
        const sampleRow = this.databases[tableName][0];
        return {
          tableName,
          columns: Object.keys(sampleRow).map(key => {
            const type = typeof sampleRow[key] === 'number' ? 'INTEGER' : 'TEXT';
            return { name: key, type, isPrimary: key === 'id' };
          })
        };
      } else {
        // Return all schemas
        const schemas = {};
        for (const table in this.databases) {
          const sampleRow = this.databases[table][0];
          schemas[table] = {
            tableName: table,
            columns: Object.keys(sampleRow).map(key => {
              const type = typeof sampleRow[key] === 'number' ? 'INTEGER' : 'TEXT';
              return { name: key, type, isPrimary: key === 'id' };
            })
          };
        }
        return schemas;
      }
    }
  }
  
  // SQLPlayground Component
  const SQLPlayground = () => {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState(null);
    const [explanation, setExplanation] = React.useState('');
    const [showExplanation, setShowExplanation] = React.useState(false);
    const [sqlEngine] = React.useState(new SimpleSQL());
    const [currentTab, setCurrentTab] = React.useState('query');
    const [schemas, setSchemas] = React.useState({});
    const [error, setError] = React.useState(null);
    const [executionTime, setExecutionTime] = React.useState(null);
    const [queryHistory, setQueryHistory] = React.useState([]);
  
    // Sample queries for users to try
    const sampleQueries = [
      'SELECT * FROM employees;',
      'SELECT name, salary FROM employees WHERE department = "Engineering";',
      'SELECT * FROM departments ORDER BY budget DESC;',
      'SELECT * FROM projects WHERE status = "In Progress";',
      'INSERT INTO employees VALUES (6, "New Person", "IT", 70000);',
      'UPDATE employees SET salary = 95000 WHERE id = 3;',
      'DELETE FROM employees WHERE id = 5;'
    ];
  
    // Load schema information when component mounts
    React.useEffect(() => {
      const allSchemas = sqlEngine.getSchema();
      setSchemas(allSchemas);
    }, [sqlEngine]);
  
    // Execute SQL query
    const executeQuery = () => {
      if (!query.trim()) return;
      
      setError(null);
      const startTime = performance.now();
      
      try {
        // Remove trailing semicolon if present
        const cleanQuery = query.trim().endsWith(';') 
          ? query.trim().slice(0, -1) 
          : query.trim();
          
        const result = sqlEngine.executeQuery(cleanQuery);
        const endTime = performance.now();
        setExecutionTime((endTime - startTime).toFixed(2));
        
        if (result.error) {
          setError(result.error);
          setResults(null);
        } else {
          setResults(result);
          
          // Generate explanation if requested
          if (showExplanation) {
            setExplanation(sqlEngine.explainQuery(cleanQuery));
          }
          
          // Add to query history
          setQueryHistory(prev => {
            const newHistory = [cleanQuery, ...prev];
            return newHistory.slice(0, 10); // Keep only the last 10 queries
          });
        }
      } catch (err) {
        setError(`Execution error: ${err.message}`);
        setResults(null);
        setExecutionTime(null);
      }
    };
  
    // Apply sample query
    const applySampleQuery = (sampleQuery) => {
      setQuery(sampleQuery);
    };
  
    // Render table schema information
    const renderSchemaInfo = () => {
      return (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Database Schema</h2>
          {Object.keys(schemas).map(tableName => (
            <div key={tableName} className="mb-4 border rounded p-3 bg-gray-50">
              <h3 className="font-semibold text-base mb-2">Table: {tableName}</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1 text-left">Column</th>
                    <th className="border px-2 py-1 text-left">Type</th>
                    <th className="border px-2 py-1 text-left">Key</th>
                  </tr>
                </thead>
                <tbody>
                  {schemas[tableName].columns.map((column, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{column.name}</td>
                      <td className="border px-2 py-1">{column.type}</td>
                      <td className="border px-2 py-1">{column.isPrimary ? 'PRIMARY KEY' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      );
    };
  
    // Render results as a table
    const renderResults = () => {
      if (!results) return null;
      
      if (results.rows && results.rows.length > 0) {
        const columns = Object.keys(results.rows[0]);
        
        return (
          <div className="mt-4 overflow-x-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Results ({results.count} row{results.count !== 1 ? 's' : ''})</h2>
              {executionTime && (
                <span className="text-sm text-gray-500">Execution time: {executionTime} ms</span>
              )}
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {columns.map((col, idx) => (
                    <th key={idx} className="border px-2 py-1 text-left">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="border px-2 py-1">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : 'NULL'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      } else if (results.message) {
        // Display message for non-SELECT queries
        return (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex justify-between items-center">
              <div className="text-green-800">
                <p className="font-semibold">{results.message}</p>
                {results.affectedRows !== undefined && (
                  <p className="text-sm">Affected rows: {results.affectedRows}</p>
                )}
                {results.lastInsertId !== undefined && (
                  <p className="text-sm">Last insert ID: {results.lastInsertId}</p>
                )}
              </div>
              {executionTime && (
                <span className="text-sm text-gray-500">Execution time: {executionTime} ms</span>
              )}
            </div>
          </div>
        );
      }
      
      return (
      <div className="p-4 bg-white rounded-lg shadow max-w-full">
        <h1 className="text-2xl font-bold mb-4">SQL Playground</h1>
        
        {/* Tab Navigation */}
        <div className="flex mb-4 border-b">
          <button 
            className={`px-4 py-2 ${currentTab === 'query' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500'}`}
            onClick={() => setCurrentTab('query')}
          >
            Query Editor
          </button>
          <button 
            className={`px-4 py-2 ${currentTab === 'schema' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500'}`}
            onClick={() => setCurrentTab('schema')}
          >
            Database Schema
          </button>
          <button 
            className={`px-4 py-2 ${currentTab === 'history' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500'}`}
            onClick={() => setCurrentTab('history')}
          >
            Query History
          </button>
        </div>
        
        {/* Query Editor Tab */}
        {currentTab === 'query' && (
          <div>
            <div className="mb-4">
              <label htmlFor="sqlQuery" className="block font-medium mb-1">SQL Query</label>
              <textarea
                id="sqlQuery"
                className="w-full p-2 border rounded h-32 font-mono"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SQL query here..."
                spellCheck="false"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={executeQuery}
              >
                Execute Query
              </button>
              
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={showExplanation}
                  onChange={() => setShowExplanation(!showExplanation)}
                />
                Explain Query
              </label>
            </div>
            
            {/* Sample Queries */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Sample Queries:</h3>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((sampleQuery, idx) => (
                  <button 
                    key={idx} 
                    className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    onClick={() => applySampleQuery(sampleQuery)}
                  >
                    {sampleQuery.length > 30 ? sampleQuery.slice(0, 30) + '...' : sampleQuery}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Query Explanation */}
            {showExplanation && explanation && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-4">
                <h3 className="font-medium mb-1">Query Explanation:</h3>
                <p>{explanation}</p>
              </div>
            )}
            
            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded mb-4">
                <h3 className="font-medium text-red-800 mb-1">Error:</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            {/* Results Display */}
            {renderResults()}
          </div>
        )}
        
        {/* Schema Tab */}
        {currentTab === 'schema' && renderSchemaInfo()}
        
        {/* History Tab */}
        {currentTab === 'history' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Query History</h2>
            {queryHistory.length > 0 ? (
              <ul className="border rounded divide-y">
                {queryHistory.map((historyItem, idx) => (
                  <li key={idx} className="p-2 hover:bg-gray-50">
                    <button 
                      className="w-full text-left font-mono text-sm"
                      onClick={() => {
                        setQuery(historyItem);
                        setCurrentTab('query');
                      }}
                    >
                      {historyItem}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No queries have been executed yet.</p>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Export the component
  window.SQLPlayground = SQLPlayground;