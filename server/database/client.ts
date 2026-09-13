import mysql, {
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const client = mysql.createPool({
  host: DB_HOST,
  port: Number.parseInt(DB_PORT ?? "3306", 10),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

type DatabaseClient = typeof client;
type Result = ResultSetHeader;
type Rows = RowDataPacket[];

export default client;

export type { DatabaseClient, Result, Rows };
