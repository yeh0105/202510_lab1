import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
// Removed useWBS import - header should be context-independent
import './Header.css';

interface CompactHeaderProps {
  showProjectSelector?: boolean;
  showStatusIndicators?: boolean;
}

export const CompactHeader: React.FC<CompactHeaderProps> = ({ 
  showProjectSelector = true, 
  showStatusIndicators = true 
}) => {
  const { user, logout } = useAuth();
  const { currentProject, projects, selectProject } = useProject();
  const navigate = useNavigate();
  const location = useLocation();
  const [showTooltips, setShowTooltips] = useState<{ [key: string]: boolean }>({});

  // WebSocket status for current project (only when project is selected)
  const { 
    connectionStatus, 
    onlineUsers, 
    latency 
  } = useWebSocket(currentProject?.project_id || '');

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    const project = projects.find(p => p.project_id === projectId);
    if (project) {
      selectProject(project);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '🌐';
      case 'connecting': return '🔄';
      case 'disconnected': return '🔴';
      default: return '❓';
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10B981';
      case 'connecting': return '#F59E0B';
      case 'disconnected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Removed save status functions - handled at Dashboard level within WBSProvider

  const showTooltip = (key: string) => {
    setShowTooltips(prev => ({ ...prev, [key]: true }));
  };

  const hideTooltip = (key: string) => {
    setShowTooltips(prev => ({ ...prev, [key]: false }));
  };

  return (
    <header className="compact-header">
      {/* Brand */}
      <h1 
        className="brand-compact"
        onClick={() => navigate('/dashboard')}
      >
        WBS
      </h1>

      {/* Project Selector */}
      {showProjectSelector && user && (
        <div className="project-selector-compact">
          <select
            className="project-dropdown-compact"
            value={currentProject?.project_id || ''}
            onChange={handleProjectChange}
          >
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project.project_id} value={project.project_id}>
                {project.name} ({project.permission})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Indicators - WebSocket only */}
      {showStatusIndicators && currentProject && (
        <div className="status-indicators-compact">
          {/* Connection Status */}
          <div 
            className="status-icon"
            onMouseEnter={() => showTooltip('connection')}
            onMouseLeave={() => hideTooltip('connection')}
            style={{ color: getConnectionColor() }}
          >
            {getConnectionIcon()}
            {showTooltips.connection && (
              <div className="status-tooltip">
                Connection: {connectionStatus}
                {latency && ` (${latency}ms)`}
              </div>
            )}
          </div>

          {/* Online Users */}
          <div 
            className="status-icon"
            onMouseEnter={() => showTooltip('users')}
            onMouseLeave={() => hideTooltip('users')}
            style={{ color: '#3B82F6' }}
          >
            👥
            {showTooltips.users && (
              <div className="status-tooltip">
                {onlineUsers.length} users online
                {onlineUsers.length > 0 && (
                  <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.8 }}>
                    {onlineUsers.slice(0, 3).map(user => user.email.split('@')[0]).join(', ')}
                    {onlineUsers.length > 3 && ` +${onlineUsers.length - 3} more`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {user && (
        <div className="nav-buttons-compact">
          <button
            onClick={() => navigate('/projects')}
            className={`nav-btn-compact ${location.pathname === '/projects' ? 'active' : ''}`}
          >
            Projects
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className={`nav-btn-compact ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
        </div>
      )}

      {/* User Info */}
      {user && (
        <div className="user-nav-compact">
          <div className="user-info-compact">
            <span className="user-email-compact">{user.email}</span>
            <span className="user-role-compact">{user.role}</span>
          </div>
          <button 
            onClick={logout}
            className="logout-btn-compact"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};