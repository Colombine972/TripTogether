export interface UserType {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  hashed_password?: string;
}
