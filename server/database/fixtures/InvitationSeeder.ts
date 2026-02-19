import crypto from "node:crypto";
import AbstractSeeder from "./AbstractSeeder";
import TripSeeder from "./TripSeeder";
import UserSeeder from "./UserSeeder";

class InvitationSeeder extends AbstractSeeder {
  constructor() {
    super({
      table: "invitation",
      truncate: true,
      dependencies: [UserSeeder, TripSeeder],
    });
  }

  async run() {
    for (let i = 0; i < 10; i += 1) {
      const CreatedDate = this.faker.date.between({
        from: "2026-01-01T00:00:00.000Z",
        to: "2026-12-31T00:00:00.000Z",
      });

      const invitedRef = `user_${(i + 1) % 5 || 1}`;
      const tripRef = `trip_${i % 3}`;

      const token = crypto.randomUUID();

      const fakeInvitation = {
        status: this.faker.helpers.arrayElement([
          "pending",
          "accepted",
          "refused",
        ]),
        email: this.faker.internet.email(),
        message: this.faker.lorem.words(5),
        created_at: CreatedDate.toISOString().split("T")[0],
        updated_at: null,
        user_id: this.getRef(invitedRef).insertId,
        trip_id: this.getRef(tripRef).insertId,
      };

      this.insert(fakeInvitation);
    }
  }
}

export default InvitationSeeder;
