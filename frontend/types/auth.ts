export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    username: string;
    quantum_score: number;
    reputation: number;
  };
}

export interface AuthError {
  detail: string;
  code?: string;
} 