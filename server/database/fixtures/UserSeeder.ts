import AbstractSeeder from "./AbstractSeeder";

class UserSeeder extends AbstractSeeder {
  constructor() {
    super({ table: "user", truncate: true });
  }

  async run() {
    for (let i = 0; i < 10; i += 1) {
      const fakeUser = {
        firstname: this.faker.person.firstName(),
        lastname: this.faker.person.lastName(),
        email: this.faker.internet.email(),
        password: this.faker.internet.password({ length: 64 }),
        refName: `user_${i}`,
      };

      this.insert(fakeUser);
    }
  }
}

export default UserSeeder;
