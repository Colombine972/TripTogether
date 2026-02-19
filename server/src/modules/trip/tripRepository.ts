import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type { Trip } from "../../types/tripType";

class TripRepository {
  async create(trip: Omit<Trip, "id">) {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO trip (title, description, city, country, start_at, end_at, user_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        trip.title,
        trip.description,
        trip.city,
        trip.country,
        trip.start_at,
        trip.end_at,
        trip.user_id,
        trip.image_url,
      ],
    );
    const newTripId = result.insertId;

    await databaseClient.query<Result>(
      "INSERT INTO step (city, country, trip_id, user_id, image_url, is_initial) VALUES (?, ?, ?, ?, ?, ?)",
      [trip.city, trip.country, newTripId, trip.user_id, trip.image_url, true],
    );

    return newTripId;
  }

  async readTripInfo(id: number): Promise<Trip | null> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT t.id, t.title, t.description, t.start_at, t.end_at, t.city, t.country, t.image_url, COUNT(i.id) AS participants 
      FROM trip t 
      LEFT JOIN invitation i ON i.trip_id = t.id AND i.status = "accepted" 
      WHERE t.id = ? 
      GROUP BY t.id`,
      [id],
    );

    if (rows.length === 0) return null;

    return rows[0] as Trip;
  }

  async isUserMemberOfTrip(tripId: number, userId: number): Promise<boolean> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT i.id
        FROM invitation AS i
        WHERE trip_id = ?
        AND user_id = ?
        AND status = "accepted"`,
      [tripId, userId],
    );

    if (rows.length > 0) return true;

    const [ownerRows] = await databaseClient.query<Rows>(
      "SELECT id FROM trip WHERE id = ? AND user_id = ?",
      [tripId, userId],
    );

    return ownerRows.length > 0;
  }
  async read(id: number): Promise<Trip | null> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT 
      t.*,
      u.firstname AS owner_firstname,
      u.lastname  AS owner_lastname
      FROM trip t
      JOIN user u ON u.id = t.user_id
      WHERE t.id = ?
      `,
      [id],
    );

    if (rows.length === 0) return null;
    return rows[0] as Trip;
  }

  async readAll() {
    const [rows] = await databaseClient.query<Rows>("SELECT * FROM trip");
    return rows as Trip[];
  }

  async update(trip: Trip) {
    const [result] = await databaseClient.query<Result>(
      `UPDATE trip 
       SET title = ?, description = ?, city = ?, country = ?, start_at = ?, end_at = ?, image_url = ? 
       WHERE id = ?`,
      [
        trip.title,
        trip.description,
        trip.city,
        trip.country,
        trip.start_at,
        trip.end_at,
        trip.image_url,
        trip.id,
      ],
    );

    return result.affectedRows;
  }

  async delete(id: number) {
    const [result] = await databaseClient.query<Result>(
      "DELETE FROM trip WHERE id = ?",
      [id],
    );

    return result.affectedRows;
  }

  async isOwner(tripId: number, userId: number): Promise<boolean> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id FROM trip WHERE id = ? AND user_id = ?",
      [tripId, userId],
    );

    return rows.length > 0;
  }

  async readByUser(userId: number, status: string) {
    let dateCondition = "";

    if (status === "futur") {
      dateCondition = "AND start_at > NOW()";
    } else if (status === "current") {
      dateCondition = "AND start_at <= NOW() AND end_at >= NOW()";
    } else if (status === "past") {
      dateCondition = "AND end_at < NOW()";
    }

    const [rows] = await databaseClient.query<Rows>(
      `SELECT 
        t.id, 
        t.title, 
        t.description, 
        t.city, 
        t.country, 
        t.start_at, 
        t.end_at, 
        t.image_url,
        u.firstname AS creator_firstname,
        u.lastname AS creator_lastname
      FROM trip t
      JOIN user u ON t.user_id = u.id
      LEFT JOIN invitation i ON i.trip_id = t.id AND i.user_id = ?
      WHERE 
        (t.user_id = ? OR i.status = 'accepted')
        ${dateCondition}
      ORDER BY t.start_at ASC`,
      [userId, userId],
    );
    return rows as Trip[];
  }

  async countTrips() {
    const [rows] = await databaseClient.query(
      "SELECT COUNT(*) AS count FROM trip",
    );
    return (rows as { count: number }[])[0].count;
  }

  async findMembersByTrip(tripId: number) {
    const [rows] = await databaseClient.query(
      `
    SELECT u.id, u.firstname, u.email
    FROM user u
    WHERE u.id = (
      SELECT user_id FROM trip WHERE id = ?
    )

    UNION

    SELECT u.id, u.firstname, u.email
    FROM user u
    JOIN invitation i ON i.user_id = u.id
    WHERE i.trip_id = ? AND i.status = 'accepted'
    `,
      [tripId, tripId],
    );

    return rows;
  }
}

export default new TripRepository();
