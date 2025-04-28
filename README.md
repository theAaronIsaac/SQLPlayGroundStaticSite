# SQLPlayGroundStaticSite
this is just a static version of the SQL playground for Pages functionality 


SQL Playground An interactive web-based SQL editor that allows users to write and execute SQL queries against mock databases in a sandbox environment. Perfect for learning SQL, testing queries, and educational purposes. Overview SQL Playground is a browser-based application that simulates a database environment where users can:

Write SQL queries in a dedicated editor Execute queries against pre-populated sample tables View query results in a formatted table Get plain English explanations of what queries do Explore database schemas and table structures Track query history for reference

Features Core Functionality

Interactive SQL Editor: Write and execute SQL queries in real-time Query Execution: Run queries against mock databases and see immediate results Query Explanation: Toggle to get natural language explanations of SQL queries Database Schema Viewer: Explore table structures, column types, and keys Query History: Track and reuse previously executed queries

Technical Features

Mock Database System: In-memory database with sample tables and data SQL Parser: Handles common SQL operations (SELECT, INSERT, UPDATE, DELETE) Query Processing: Supports WHERE clauses, ORDER BY, LIMIT, and column selection Error Handling: Clear error messages for invalid queries Performance Metrics: Tracks query execution time

Sample Data The playground includes three pre-populated tables:

employees: Employee records with name, department, and salary departments: Department information with budget data projects: Project tracking with status and budget allocation

Usage Writing Queries

Enter your SQL query in the editor Click "Execute Query" to run it View results in the table below Toggle "Explain Query" to get a plain English explanation

Sample Queries The playground provides sample queries to help you get started: sql-- View all employees SELECT * FROM employees;

-- Get names and salaries of engineering employees SELECT name, salary FROM employees WHERE department = "Engineering";

-- List departments by budget (highest first) SELECT * FROM departments ORDER BY budget DESC;

-- Show in-progress projects SELECT * FROM projects WHERE status = "In Progress";

-- Add a new employee INSERT INTO employees VALUES (6, "New Person", "IT", 70000);

-- Update an employee's salary UPDATE employees SET salary = 95000 WHERE id = 3;

-- Remove an employee DELETE FROM employees WHERE id = 5; Supported SQL Operations

SELECT: Query data with filtering, sorting, and limiting INSERT: Add new records to tables UPDATE: Modify existing data with conditions DELETE: Remove records with conditions

Implementation Details The SQL Playground is built as a pure JavaScript/React application with:

React for the user interface Custom SQL Parser for query processing In-memory Database for data storage and querying Tailwind CSS for styling

Educational Value SQL Playground is designed as an educational tool that helps users:

Learn SQL syntax in a risk-free environment Understand how different queries affect data Explore database concepts and table relationships Practice SQL without needing to set up a database server

Getting Started

Access the SQL Playground in your browser Explore the sample tables in the "Database Schema" tab Try a sample query or write your own in the "Query Editor" tab Click "Execute Query" to see the results Use the "Explain Query" feature to understand what your query does

SQL Playground is intended for educational purposes and doesn't connect to real databases. It simulates SQL functionality in a sandboxed environment.
