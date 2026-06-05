export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface LoginResponse {
  user: AuthUser;
  auth: {
    accessToken: string;
    expiresIn: string;
  };
}
