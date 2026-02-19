import client from "./client";

client
  .getConnection()
  .then((connection) => {
    console.info(`Using database ${process.env.DB_NAME}`);

    connection.release();
  })
  .catch((error: Error) => {
    console.warn(
      "Warning:",
      "Failed to establish a database connection.",
      "Please check your database credentials in the .env file if you need a database access.",
    );
    console.warn(error.message);
  });
