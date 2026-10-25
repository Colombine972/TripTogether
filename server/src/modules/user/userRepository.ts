import databaseClient from "../../../database/client";

import type { Result, Rows } from "../../../database/client";
import { finalizeStepWithinTransaction } from "../step/stepVoteFinalizationService";

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
      `
      SELECT
        id,
        firstname,
        lastname,
        email,
        avatar_url
      FROM user
      WHERE id = ?
    `,
      [id],
    );

    return rows[0] as Omit<User, "password">;
  }

  async readByEmail(email: string) {
    const [rows] = await databaseClient.query<Rows>(
      "select * from user where email = ?",
      [email],
    );

    return rows[0] as User;
  }

  async readAll() {
    const [rows] = await databaseClient.query<Rows>(
      `
      SELECT
        id,
        firstname,
        lastname,
        email,
        avatar_url
      FROM user
      ORDER BY lastname, firstname
    `,
    );

    return rows as Omit<User, "password">[];
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

  async readPasswordById(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT id, password
        FROM user
        WHERE id = ?
      `,
      [id],
    );

    return (rows[0] as Pick<User, "id" | "password">) ?? null;
  }

  async updatePassword(id: number, hashedPassword: string) {
    const [result] = await databaseClient.query<Result>(
      `
        UPDATE user
        SET password = ?
        WHERE id = ?
      `,
      [hashedPassword, id],
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

      /* =====================================================
   VERROUILLER LES VOYAGES CONCERNÉS PAR LE COMPTE

   Évite qu'un vote ou une finalisation se produise
   simultanément à la suppression des invitations.
===================================================== */

      const [affectedTrips] = await connection.query<Rows>(
        `
    SELECT DISTINCT t.id
    FROM trip t
    LEFT JOIN invitation i ON i.trip_id = t.id
    WHERE t.user_id = ?
       OR i.user_id = ?
       OR i.email = ?
    ORDER BY t.id
  `,
        [userId, userId, currentEmail],
      );

      for (const trip of affectedTrips) {
        await connection.query<Rows>(
          `
      SELECT id
      FROM trip
      WHERE id = ?
      FOR UPDATE
    `,
          [Number(trip.id)],
        );
      }

      /* =====================================================
   FINALISER LES VOTES CLÔTURÉS AVANT SUPPRESSION
   Les voyages concernés sont déjà verrouillés.
===================================================== */

      const dateParts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date());

      const getDatePart = (type: string) =>
        dateParts.find((part) => part.type === type)?.value ?? "";

      const todayInParis = `${getDatePart("year")}-${getDatePart("month")}-${getDatePart("day")}`;

      for (const trip of affectedTrips) {
        const tripId = Number(trip.id);

        const [pendingSteps] = await connection.query<Rows>(
          `
      SELECT s.id
      FROM step s
      JOIN trip t ON t.id = s.trip_id
      WHERE s.trip_id = ?
        AND s.is_initial = 0
        AND s.vote_status = 'pending'
        AND DATE_FORMAT(t.start_at, '%Y-%m-%d') <= ?
      ORDER BY s.id
    `,
          [tripId, todayInParis],
        );

        for (const step of pendingSteps) {
          const finalized = await finalizeStepWithinTransaction(
            connection,
            Number(step.id),
            tripId,
          );

          if (!finalized) {
            throw new Error(
              `Impossible de finaliser la destination ${step.id}`,
            );
          }
        }
      }

      /* =====================================================
   IDENTIFIER LES NOUVEAUX ORGANISATEURS

   En cas de suppression du compte propriétaire,
   sélectionner le premier participant accepté.
===================================================== */

      const ownedTripTransfers: {
        tripId: number;
        newOwnerId: number;
      }[] = [];

      for (const trip of affectedTrips) {
        const tripId = Number(trip.id);

        const [ownedTrips] = await connection.query<Rows>(
          `
      SELECT user_id
      FROM trip
      WHERE id = ?
    `,
          [tripId],
        );

        if (Number(ownedTrips[0]?.user_id) !== userId) {
          continue;
        }

        const [candidates] = await connection.query<Rows>(
          `
      SELECT i.user_id
      FROM invitation i
      WHERE i.trip_id = ?
        AND i.status = 'accepted'
        AND i.user_id IS NOT NULL
        AND i.user_id <> ?
      ORDER BY i.created_at ASC, i.id ASC
      LIMIT 1
    `,
          [tripId, userId],
        );

        if (candidates.length === 0) {
          throw new Error(
            `Suppression du compte impossible : aucun repreneur pour le voyage ${tripId}.`,
          );
        }

        ownedTripTransfers.push({
          tripId,
          newOwnerId: Number(candidates[0].user_id),
        });
      }

      /* =====================================================
   TRANSFÉRER LES VOYAGES AU NOUVEL ORGANISATEUR

   Les voyages sont déjà verrouillés.
   Les votes finalisés restent inchangés.
===================================================== */

      for (const transfer of ownedTripTransfers) {
        // Transférer la propriété du voyage.
        const [result] = await connection.query<Result>(
          `
      UPDATE trip
      SET user_id = ?
      WHERE id = ?
        AND user_id = ?
    `,
          [transfer.newOwnerId, transfer.tripId, userId],
        );

        if (result.affectedRows !== 1) {
          throw new Error(
            `Impossible de transférer le voyage ${transfer.tripId}.`,
          );
        }

        // Le nouveau propriétaire n'a plus besoin
        // de son ancienne invitation acceptée.
        await connection.query<Result>(
          `
      DELETE FROM invitation
      WHERE trip_id = ?
        AND user_id = ?
        AND status = 'accepted'
    `,
          [transfer.tripId, transfer.newOwnerId],
        );
      }

      /* =====================================================
   SUPPRIMER LES VOTES NON FINALISÉS DU COMPTE

   Les votes déjà finalisés sont conservés.
   Les voyages concernés ont été verrouillés.
===================================================== */

      for (const trip of affectedTrips) {
        const tripId = Number(trip.id);

        await connection.query<Result>(
          `
      DELETE v
      FROM vote v
      JOIN step s ON s.id = v.step_id
      WHERE v.user_id = ?
        AND s.trip_id = ?
        AND s.vote_finalized_at IS NULL
    `,
          [userId, tripId],
        );
      }

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
