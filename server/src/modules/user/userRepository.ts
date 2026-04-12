import databaseClient from "../../../database/client";

import type { Result, Rows } from "../../../database/client";

type User = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  avatar_url?: string;
};

type UpdateUser = {
  firstname: string;
  lastname: string;
  email: string;
  avatar_url?: string;
};

type UserExportData = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  avatar_url?: string | null;
};

type DeleteMyAccountData = {
  userId: number;
  currentEmail: string;
  anonymizedEmail: string;
  anonymizedPassword: string;
};

type UserPreference = {
  email_notifications: boolean;
  theme: string;
};

class UserRepository {
  async create(user: Omit<User, "id">) {
    const [result] = await databaseClient.query<Result>(
      "insert into user (firstname, lastname, email, password) values (?, ?, ?, ?)",
      [user.firstname, user.lastname, user.email, user.password],
    );

    return result.insertId;
  }

  async read(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      "select * from user where id = ?",
      [id],
    );

    return rows[0] as User;
  }

  async readByEmail(email: string) {
    const [rows] = await databaseClient.query<Rows>(
      "select * from user where email = ?",
      [email],
    );

    return rows[0] as User;
  }

  async readAll() {
    const [rows] = await databaseClient.query<Rows>("select * from user");

    return rows as User[];
  }

  async findByEmail(email: string) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id FROM user WHERE email = ?",
      [email],
    );

    return rows[0] as User;
  }

  async update(id: number, user: UpdateUser) {
    const [result] = await databaseClient.query<Result>(
      "UPDATE user SET firstname = ?, lastname = ?, email = ?, avatar_url = ? WHERE id = ?",
      [user.firstname, user.lastname, user.email, user.avatar_url ?? null, id],
    );

    return result;
  }

  async readExportProfile(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT id, firstname, lastname, email, avatar_url
        FROM user
        WHERE id = ?
      `,
      [id],
    );

    return (rows[0] as UserExportData) ?? null;
  }

  async readPreferencesByUserId(_userId: number) {
    // À adapter plus tard si tu crées une vraie table user_preferences
    return {
      email_notifications: false,
      theme: "light",
    } as UserPreference;
  }

  async readOwnedTripsByUserId(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT
          id,
          title,
          description,
          city,
          country,
          start_at,
          end_at,
          photo_reference,
          user_id
        FROM trip
        WHERE user_id = ?
        ORDER BY start_at DESC
      `,
      [userId],
    );

    return rows;
  }

  async readParticipatedTripsByUserId(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT DISTINCT
          t.id,
          t.title,
          t.description,
          t.city,
          t.country,
          t.start_at,
          t.end_at,
          t.photo_reference,
          i.status AS invitation_status
        FROM invitation AS i
        INNER JOIN trip AS t ON t.id = i.trip_id
        WHERE i.user_id = ?
        ORDER BY t.start_at DESC
      `,
      [userId],
    );

    return rows;
  }

  async readExpensesByUserId(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT
          e.id,
          e.trip_id,
          e.title,
          e.amount,
          e.date,
          e.paid_by,
          e.category_id,
          ec.name AS category_name
        FROM expense AS e
        LEFT JOIN expense_category AS ec ON ec.id = e.category_id
        WHERE e.paid_by = ?
        ORDER BY e.date DESC, e.id DESC
      `,
      [userId],
    );

    return rows;
  }

  async readExpenseSharesByUserId(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT
          es.id,
          es.expense_id,
          es.user_id,
          es.share_amount
        FROM expense_share AS es
        WHERE es.user_id = ?
        ORDER BY es.id DESC
      `,
      [userId],
    );

    return rows;
  }

  async readInvitationsByUserId(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT
          i.id,
          i.trip_id,
          i.user_id,
          i.email,
          i.message,
          i.status,
          i.trip_status,
          i.created_at,
          i.updated_at
        FROM invitation AS i
        WHERE i.user_id = ?
           OR i.email = (
             SELECT email
             FROM user
             WHERE id = ?
           )
        ORDER BY i.created_at DESC
      `,
      [userId, userId],
    );

    return rows;
  }

    async deleteMyAccount(data: DeleteMyAccountData) {
    const { userId, currentEmail, anonymizedEmail, anonymizedPassword } = data;

    const connection = await databaseClient.getConnection();

    try {
      await connection.beginTransaction();

      /**
       * Suppression des invitations associées au compte.
       * Ici, on supprime :
       * - les invitations liées à user_id
       * - les invitations envoyées à l'email actuel de l'utilisateur
       */
      await connection.query<Result>(
        `
          DELETE FROM invitation
          WHERE user_id = ?
             OR email = ?
        `,
        [userId, currentEmail],
      );

      /**
       * Anonymisation du compte utilisateur.
       * On conserve la ligne en base pour ne pas casser :
       * - trip.user_id
       * - expense.paid_by
       * - expense_share.user_id
       *
       * Mais on supprime les données personnelles.
       */
      await connection.query<Result>(
        `
          UPDATE user
          SET
            firstname = ?,
            lastname = ?,
            email = ?,
            password = ?,
            avatar_url = NULL
          WHERE id = ?
        `,
        [
          "utilisateur",
          "supprimé",
          anonymizedEmail,
          anonymizedPassword,
          userId,
        ],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new UserRepository();
