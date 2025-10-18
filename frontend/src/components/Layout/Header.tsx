import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h1 
          style={{ margin: 0, fontSize: '1.5rem', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          WBS Project Management
        </h1>
        
        {user && (
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/projects')}
              style={{
                backgroundColor: location.pathname === '/projects' ? '#3498db' : 'transparent',
                color: 'white',
                border: '1px solid #3498db',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Projects
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                backgroundColor: location.pathname === '/dashboard' ? '#3498db' : 'transparent',
                color: 'white',
                border: '1px solid #3498db',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Dashboard
            </button>
          </nav>
        )}
      </div>
      
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, {user.email}</span>
          <span style={{
            backgroundColor: '#3498db',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.8rem'
          }}>
            {user.role}
          </span>
          <button 
            onClick={logout}
            style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};