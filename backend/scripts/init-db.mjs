import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(scriptDir, "..");

dotenv.config({ path: path.join(backendRoot, ".env") });

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true
});

await connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");

function splitSqlStatements(sql) {
  const lines = sql.split(/\r?\n/);
  const statements = [];
  let delimiter = ";";
  let buffer = "";

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();

    if (trimmedLine.startsWith("DELIMITER ")) {
      delimiter = trimmedLine.slice("DELIMITER ".length).trim();
      continue;
    }

    if (!trimmedLine && !buffer) {
      continue;
    }

    buffer += `${rawLine}\n`;

    if (buffer.trimEnd().endsWith(delimiter)) {
      const statement = buffer.trimEnd().slice(0, -delimiter.length).trim();
      if (statement) {
        statements.push(statement);
      }
      buffer = "";
    }
  }

  const leftover = buffer.trim();
  if (leftover) {
    statements.push(leftover);
  }

  return statements;
}

async function runSqlFile(filePath) {
  const sql = await fs.readFile(filePath, "utf8");
  const statements = splitSqlStatements(sql);

  for (const statement of statements) {
    await connection.query(statement);
  }
}

try {
  await runSqlFile(path.join(backendRoot, "db", "schema.sql"));
  await runSqlFile(path.join(backendRoot, "db", "sample_data.sql"));
  console.log("Database schema and sample data loaded successfully.");
} catch (error) {
  console.error("Database initialization failed:");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}