import AbstractSeeder from "./AbstractSeeder";
import InvitationSeeder from "./InvitationSeeder";
import StepSeeder from "./StepSeeder";
import TripSeeder from "./TripSeeder";
import UserSeeder from "./UserSeeder";

class VoteSeeder extends AbstractSeeder {
  constructor() {
    super({
      table: "vote",
      truncate: true,
      dependencies: [UserSeeder, TripSeeder, InvitationSeeder, StepSeeder],
    });
  }

  async run() {
    let stepIndex = 0;

    while (this.getRef(`step_${stepIndex}`)) {
      const stepRef = this.getRef(`step_${stepIndex}`) as unknown as {
        insertId: number;
        trip_id: number;
      };

      const stepId = stepRef.insertId;
      const tripId = stepRef.trip_id;

      const members = this.getTripMembers(tripId);

      if (members.length === 0) {
        stepIndex++;
        continue;
      }

      const votantsCount = this.faker.number.int({
        min: 1,
        max: members.length,
      });

      const selectedMembers = this.faker.helpers
        .shuffle(members)
        .slice(0, votantsCount);

      for (const userId of selectedMembers) {
        const createdDate = this.faker.date.between({
          from: "2026-01-01T00:00:00.000Z",
          to: new Date(),
        });

        const fakeVote = {
          created_at: createdDate.toISOString().split("T")[0],
          user_id: userId,
          step_id: stepId,
          vote: this.faker.datatype.boolean(),
          comment: this.faker.helpers.maybe(() => this.faker.lorem.sentence(), {
            probability: 0.6,
          }),
        };

        this.insert(fakeVote);
      }

      stepIndex++;
    }
  }

  getTripMembers(tripId: number): number[] {
    const members: number[] = [];

    let tripIndex = 0;
    while (this.getRef(`trip_${tripIndex}`)) {
      const trip = this.getRef(`trip_${tripIndex}`) as unknown as {
        insertId: number;
        user_id: number;
      };

      if (trip.insertId === tripId) {
        members.push(trip.user_id);
      }

      tripIndex++;
    }

    let invIndex = 0;
    while (this.getRef(`invitation_${invIndex}`)) {
      const inv = this.getRef(`invitation_${invIndex}`) as unknown as {
        trip_id: number;
        user_id: number;
        status: string;
      };

      if (inv.trip_id === tripId && inv.status === "accepted") {
        members.push(inv.user_id);
      }

      invIndex++;
    }

    return members;
  }
}

export default VoteSeeder;
