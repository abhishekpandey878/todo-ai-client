export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AuthFormPayload {
  name?: string;
  email: string;
  password: string;
}
