export interface User {
  email: string;
  role: 'Admin' | 'User';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface GoogleLoginResponse {
  credential: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}