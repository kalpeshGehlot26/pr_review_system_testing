  import { UserService } from "./user-service";

  export class AuthHandler {
      constructor(private users: UserService) {}

      async login(email: string, password: string): Promise<string> {
          const user = await this.users.findByEmail(email);
          if (!user) {
              throw new Error("Not found");
          }
          return this.signToken(user.id);
      }

      private signToken(id: string): string {
          return `token-${id}`;
      }
  }

  export function logEvent(name: string, data: object): void {
      console.log(name, data);
  }

  interface User {
      id: string;
      email: string;
  }

  const MAX_RETRIES = 3;
