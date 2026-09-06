import crypto from "node:crypto";

import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

type Invitation = {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;

  public_token: string;

  user_id: number | null;
  trip_id: number;

  email?: string | null;
  message?: string | null;

  trip_title?: string;

  trip_start?: string | Date;
  trip_end?: string | Date;

  /* Pour MyTrips / invitations en attente */
  trip_start_at?: string | Date;
  trip_end_at?: string | Date;

  trip_city?: string | null;
  trip_country?: string | null;
  trip_place_id?: string | null;

  creator_id?: number;
  creator_firstname?: string;
  creator_lastname?: string;
  creator_avatar_url?: string | null;

  invited_firstname?: string;
  invited_lastname?: string;
  invited_avatar_url?: string | null;
};

type InvitationUser = {
  id: number;
  email: string;
};

class InvitationRepository {
  /* =========================================================
     LIRE UNE INVITATION PAR ID
  ========================================================= */

  async read(id: number): Promise<Invitation | null> {
    const [rows] = await databaseClient.query<Rows>(
      `
          SELECT
            i.*,
            t.start_at AS trip_start,
            t.end_at AS trip_end
          FROM invitation i

          JOIN trip t
            ON t.id = i.trip_id

          WHERE i.id = ?
        `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as Invitation;
  }

  /* =========================================================
     LIRE UNE INVITATION COMPLÈTE PAR ID
  ========================================================= */

  async select(id: number): Promise<Invitation | null> {
    const [rows] = await databaseClient.query<Rows>(
      `
          SELECT
            i.*,

            t.title AS trip_title,
            t.start_at AS trip_start,
            t.end_at AS trip_end,
            t.city AS trip_city,
            t.country AS trip_country,
            t.place_id AS trip_place_id,
            t.user_id AS creator_id,

            c.firstname AS creator_firstname,
            c.lastname AS creator_lastname,
            c.avatar_url AS creator_avatar_url,

            u.firstname AS invited_firstname,
            u.lastname AS invited_lastname,
            u.avatar_url AS invited_avatar_url

          FROM invitation i

          JOIN trip t
            ON t.id = i.trip_id

          JOIN user c
            ON c.id = t.user_id

          LEFT JOIN user u
            ON u.id = i.user_id

          WHERE i.id = ?
        `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as Invitation;
  }

  /* =========================================================
     LIRE UNE INVITATION PAR TOKEN PUBLIC
  ========================================================= */

  async readByPublicToken(publicToken: string): Promise<Invitation | null> {
    const [rows] = await databaseClient.query<Rows>(
      `
          SELECT
            i.*,

            t.title AS trip_title,
            t.start_at AS trip_start,
            t.end_at AS trip_end,
            t.city AS trip_city,
            t.country AS trip_country,
            t.place_id AS trip_place_id,
            t.user_id AS creator_id,

            c.firstname AS creator_firstname,
            c.lastname AS creator_lastname,
            c.avatar_url AS creator_avatar_url,

            u.firstname AS invited_firstname,
            u.lastname AS invited_lastname,
            u.avatar_url AS invited_avatar_url

          FROM invitation i

          JOIN trip t
            ON t.id = i.trip_id

          JOIN user c
            ON c.id = t.user_id

          LEFT JOIN user u
            ON u.id = i.user_id

          WHERE i.public_token = ?

          LIMIT 1
        `,
      [publicToken],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as Invitation;
  }

  /* =========================================================
     TROUVER UN UTILISATEUR PAR ID
     UTILISÉ POUR VÉRIFIER L'EMAIL DU COMPTE CONNECTÉ
  ========================================================= */

  async findUserById(userId: number): Promise<InvitationUser | null> {
    const [rows] = await databaseClient.query<Rows>(
      `
          SELECT
            id,
            email

          FROM user

          WHERE id = ?

          LIMIT 1
        `,
      [userId],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as InvitationUser;
  }

  /* =========================================================
     LISTER LES INVITATIONS EN ATTENTE
     D'UN UTILISATEUR
  ========================================================= */

  async selectPendingByUser(userId: number): Promise<Invitation[]> {
    const [rows] = await databaseClient.query<Rows>(
      `
          SELECT
            i.id,
            i.trip_id,
            i.user_id,
            i.email,
            i.message,
            i.status,
            i.public_token,
            i.created_at,
            i.updated_at,

            t.title AS trip_title,
            t.city AS trip_city,
            t.country AS trip_country,
            t.place_id AS trip_place_id,
            t.start_at AS trip_start_at,
            t.end_at AS trip_end_at,
            t.user_id AS creator_id,

            c.firstname AS creator_firstname,
            c.lastname AS creator_lastname,
            c.avatar_url AS creator_avatar_url

          FROM invitation i

          JOIN trip t
            ON t.id = i.trip_id

          JOIN user c
            ON c.id = t.user_id

          WHERE i.user_id = ?
            AND i.status = 'pending'
            AND t.end_at >= CURRENT_DATE

          ORDER BY i.created_at DESC
        `,
      [userId],
    );

    return rows as Invitation[];
  }

  /* =========================================================
     MODIFIER LE STATUT
  ========================================================= */

  async updateStatus(
    id: number,
    status: "accepted" | "refused",
  ): Promise<boolean> {
    const [result] = await databaseClient.query<Result>(
      `
          UPDATE invitation

          SET
            status = ?,
            updated_at = CURRENT_TIMESTAMP

          WHERE id = ?
        `,
      [status, id],
    );

    return result.affectedRows === 1;
  }

  /* =========================================================
     CRÉER UNE INVITATION
     + GÉNÉRER LE TOKEN PUBLIC
  ========================================================= */

  async create(
    tripId: number,
    email: string,
    message: string,
    userId: number | null,
  ): Promise<{
    invitationId: number;
    publicToken: string;
  }> {
    const publicToken = crypto.randomBytes(32).toString("hex");

    const [result] = await databaseClient.query<Result>(
      `
          INSERT INTO invitation (
            trip_id,
            email,
            message,
            status,
            public_token,
            user_id
          )

          VALUES (
            ?,
            ?,
            ?,
            'pending',
            ?,
            ?
          )
        `,
      [tripId, email, message || null, publicToken, userId],
    );

    return {
      invitationId: result.insertId,

      publicToken,
    };
  }

  /* =========================================================
     COMPTER LES PARTICIPANTS
  ========================================================= */

  async readParticipate(id: number): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      `
          SELECT
            COUNT(i.id) + 1 AS participants

          FROM invitation i

          WHERE i.trip_id = ?
            AND i.status = 'accepted'
        `,
      [id],
    );

    return Number(rows[0]?.participants ?? 0);
  }

  /* =========================================================
     LISTER LES INVITATIONS D'UN VOYAGE
  ========================================================= */

  async selectByTrip(tripId: number): Promise<Invitation[]> {
    const [rows] = await databaseClient.query<Rows>(
      `
          SELECT
            i.*,

            t.title AS trip_title,
            t.start_at AS trip_start,
            t.end_at AS trip_end,

            u.firstname AS invited_firstname,
            u.lastname AS invited_lastname,
            u.avatar_url AS invited_avatar_url

          FROM invitation i

          JOIN trip t
            ON t.id = i.trip_id

          LEFT JOIN user u
            ON u.id = i.user_id

          WHERE i.trip_id = ?

          ORDER BY i.created_at ASC
        `,
      [tripId],
    );

    return rows as Invitation[];
  }

  /* =========================================================
     SUPPRIMER UN PARTICIPANT / INVITATION ACCEPTÉE
  ========================================================= */

  async deleteInvitation(tripId: number, userId: number): Promise<boolean> {
    /* =====================================================
       SUPPRESSION DES VOTES DU PARTICIPANT
       SUR CE VOYAGE
    ====================================================== */

    await databaseClient.query(
      `
        DELETE v

        FROM vote v

        JOIN step s
          ON v.step_id = s.id

        WHERE v.user_id = ?
          AND s.trip_id = ?
      `,
      [userId, tripId],
    );

    /* =====================================================
       SUPPRESSION DE L'INVITATION ACCEPTÉE
    ====================================================== */

    const [result] = await databaseClient.query<Result>(
      `
          DELETE FROM invitation

          WHERE trip_id = ?
            AND user_id = ?
            AND status = 'accepted'
        `,
      [tripId, userId],
    );

    return result.affectedRows === 1;
  }

  /* =========================================================
     RATTACHER LES INVITATIONS EN ATTENTE
     À UN UTILISATEUR APRÈS SON INSCRIPTION
  ========================================================= */

  async updateUserId(userId: number, email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();

    const [result] = await databaseClient.query<Result>(
      `
          UPDATE invitation

          SET
            user_id = ?,
            updated_at = CURRENT_TIMESTAMP

          WHERE LOWER(email) = ?
            AND status = 'pending'
            AND user_id IS NULL
        `,
      [userId, normalizedEmail],
    );

    return result.affectedRows > 0;
  }
}

export default new InvitationRepository();
