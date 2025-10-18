import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

interface GoogleLoginButtonProps {
  onError?: (error: string) => void;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onError }) => {
  const { login, isLoading } = useAuth();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError?.('No credential received from Google');
      return;
    }

    try {
      await login(credentialResponse.credential);
    } catch (error: any) {
      console.error('Login failed:', error);
      onError?.(error.response?.data?.detail || 'Login failed. Please try again.');
    }
  };

  const handleError = () => {
    onError?.('Google login failed. Please try again.');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </div>
  );
};