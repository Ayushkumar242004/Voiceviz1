import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import mysql from "mysql2/promise";
import { Pool as PostgresPool } from "pg";

export async function POST(req: Request) {
  try {
    // Parse request body
    const requestBody = await req.json();
    console.log("Received request body:", requestBody);
    
    // Extract database connection details
    const { type, host, port, database, username, password, query } = requestBody;

    if (!type || !host || !port || !database || !username || !password || !query) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    let result;
    // Execute query based on the database type
    switch (type.toLowerCase()) {
      case "mysql":
        result = await executeMySQLQuery(
          { host, port, database, user: username, password },
          query
        );
        break;

      case "postgres":
      case "postgresql":
        result = await executePostgresQuery(
          { host, port, database, user: username, password },
          query
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unsupported database type: ${type}` },
          { status: 400 }
        );
    }

    console.log("Query Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Query execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute query" },
      { status: 500 }
    );
  }
}

async function executeMySQLQuery(config: any, query: string) {
  try {
    console.log("Connecting to MySQL with config:", config);
    const connection = await mysql.createConnection(config);
    const [rows] = await connection.execute(query);
    await connection.end();

    console.log("Query Execution Successful:", rows);
    return { success: true, data: rows };
  } catch (error) {
    console.error("MySQL error:", error);
    return { success: false, error: (error as Error).message };
  }
}

async function executePostgresQuery(config: any, query: string) {
  try {
    console.log("Connecting to PostgreSQL with config:", config);
    const pool = new PostgresPool(config);
    const result = await pool.query(query);
    await pool.end();

    console.log("Query Execution Successful:", result.rows);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error("PostgreSQL error:", error);
    return { success: false, error: (error as Error).message };
  }
}
