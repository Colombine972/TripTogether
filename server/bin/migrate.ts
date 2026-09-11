import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schema = path.join(__dirname, "../database/schema.sql");

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const migrate = async () => {
  try {
    if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
      throw new Error(
        "Variables de connexion à la base de données manquantes.",
      );
    }

    const sql = fs.readFileSync(schema, "utf8");

    const database = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true,
    });

    await database.query(sql);

    await database.end();

    console.info(`Schema appliqué avec succès sur la base '${DB_NAME}' ✅`);
  } catch (err) {
    const { message, stack } = err as Error;

    console.error("Erreur lors de la migration :", message, stack);

    process.exit(1);
  }
};

migrate();
