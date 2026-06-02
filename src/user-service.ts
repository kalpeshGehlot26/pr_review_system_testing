  export class UserService {
      async findByEmail(email: string): Promise<{ id: string } | null> {
          return { id: "user-123" };
      }
  }
