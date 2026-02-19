import AbstractSeeder from "./AbstractSeeder";
import UserSeeder from "./UserSeeder";

class TripSeeder extends AbstractSeeder {
  constructor() {
    super({ table: "trip", truncate: true, dependencies: [UserSeeder] });
  }

  async run() {
    for (let i = 0; i < 10; i += 1) {
      const startDate = this.faker.date.between({
        from: "2026-01-01T00:00:00.000Z",
        to: "2026-12-31T00:00:00.000Z",
      });

      const endDate = new Date(startDate);
      endDate.setDate(
        endDate.getDate() + this.faker.number.int({ min: 1, max: 14 }),
      );

      const userId = this.getRef(`user_${i}`).insertId;

      const fakeTrip = {
        title: this.faker.lorem.words(3),
        description: this.faker.lorem.sentence(),
        city: this.faker.location.city(),
        country: this.faker.location.country(),
        start_at: startDate.toISOString().split("T")[0],
        end_at: endDate.toISOString().split("T")[0],
        user_id: userId,
        refName: `trip_${i}`,
      };

      this.insert(fakeTrip);
    }
  }
}

export default TripSeeder;
