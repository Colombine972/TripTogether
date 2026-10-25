import client from "./client";
import type { Rows } from "./client";

client
  .getConnection()
  .then(async (connection) => {
    try {
      const [rows] = await connection.query<Rows>(
        `
          SELECT
            DATABASE() AS database_name,
            @@hostname AS mysql_server,
            @@port AS mysql_port,
            @@version AS mysql_version
        `,
      );

      console.info("Connexion MySQL :", rows[0]);
    } finally {
      connection.release();
    }
  })
  .catch((error: Error) => {
    console.warn("Connexion MySQL impossible :", error.message);
  });
