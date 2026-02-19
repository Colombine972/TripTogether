import AbstractSeeder from "./AbstractSeeder";
import TripSeeder from "./TripSeeder";

class StepSeeder extends AbstractSeeder {
  constructor() {
    super({ table: "step", truncate: true, dependencies: [TripSeeder] });
  }

  async run() {
    let tripCount = 0;
    while (this.getRef(`trip_${tripCount}`)) {
      tripCount++;
    }

    let stepIndex = 0;

    for (let tripIndex = 0; tripIndex < tripCount; tripIndex++) {
      const tripRef = this.getRef(`trip_${tripIndex}`) as {
        insertId: number;
        user_id: number;
      };
      const tripId = tripRef.insertId;
      const tripUserId = tripRef.user_id;

      const stepsPerTrip = this.faker.number.int({ min: 3, max: 7 });

      for (let i = 0; i < stepsPerTrip; i++) {
        const fakeStep = {
          city: this.faker.location.city(),
          country: this.faker.location.country(),
          trip_id: tripId,
          user_id: tripUserId,
          refName: `step_${stepIndex}`,
        };

        this.insert(fakeStep);
        stepIndex++;
      }
    }
  }
}

export default StepSeeder;
