export interface RegisterRequest {
  email: string;
  username: string;
  name: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}