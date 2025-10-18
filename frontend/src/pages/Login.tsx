import React, { useState } from 'react';
import { GoogleLoginButton } from '../components/auth';

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
          WBS Project Management
        </h1>
        <h2 style={{ color: '#7f8c8d', fontSize: '1.2rem', marginBottom: '2rem' }}>
          Sign in with Google
        </h2>
        
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}
        
        <GoogleLoginButton onError={handleLoginError} />
        
        <p style={{
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: '#7f8c8d'
        }}>
          Only authorized Google accounts can access this system.
        </p>
      </div>
    </div>
  );
};

export default Login;