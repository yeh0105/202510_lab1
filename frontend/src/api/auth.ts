const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface GoogleAuthResponse {
  access_token: string;
  user: {
    email: string;
    name: string;
    picture?: string;
    role: string;
  };
}

export const authApi = {
  async authenticate(googleToken: string): Promise<GoogleAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: googleToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Authentication failed');
    }

    return response.json();
  },

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};