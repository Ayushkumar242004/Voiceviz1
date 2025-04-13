import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import mysql from "mysql2/promise";
import { Pool as PostgresPool } from "pg";

export async function POST(req: Request) {
  try {
    // Check authentication
   

    const { type, host, port, database, username, password } = await req.json();
    console.log("Received request body:", { type, host, port, database, username });

    if (!type || !host || !database) {
      console.log("Missing required connection parameters");
      return NextResponse.json(
        { error: "Missing required connection parameters" },
        { status: 400 }
      );
    }

    // Test the connection based on the database type
    let connectionResult;

    switch (type.toLowerCase()) {
      case "mysql":
        console.log("Testing MySQL connection...");
        connectionResult = await testMySQLConnection({
          host,
          port: port || 3306,
          database,
          user: username,
          password,
        });
        break;

      case "postgresql":
      case "postgres":
        console.log("Testing PostgreSQL connection...");
        connectionResult = await testPostgresConnection({
          host,
          port: port || 5432,
          database,
          user: username,
          password,
        });
        break;

      default:
        console.log(`Unsupported database type: ${type}`);
        return NextResponse.json(
          { error: `Unsupported database type: ${type}` },
          { status: 400 }
        );
    }

    if (connectionResult.success) {
      console.log("Database connection successful");
      return NextResponse.json({
        success: true,
        message: "Database connection successful",
      });
    } else {
      console.log("Database connection failed:", connectionResult.error);
      return NextResponse.json(
        { error: connectionResult.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { error: "Failed to connect to database" },
      { status: 500 }
    );
  }
}

async function testMySQLConnection(config: any) {
  try {
    console.log("MySQL connection config:", config);
    const connection = await mysql.createConnection(config);
    await connection.ping();
    await connection.end();
    console.log("MySQL connection successful");
    return { success: true };
  } catch (error) {
    console.error("MySQL connection error:", error);
    return { success: false, error: (error as Error).message };
  }
}

async function testPostgresConnection(config: any) {
  try {
    console.log("PostgreSQL connection config:", config);
    const pool = new PostgresPool(config);
    const client = await pool.connect();
    client.release();
    await pool.end();
    console.log("PostgreSQL connection successful");
    return { success: true };
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    return { success: false, error: (error as Error).message };
  }
}