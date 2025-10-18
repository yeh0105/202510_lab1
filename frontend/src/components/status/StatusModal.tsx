import React, { useState } from 'react';
import { OnlineUser } from '../../types/collaboration';
import './StatusModal.css';

interface StatusModalProps {
  projectId: string;
  connectionStatus: string;
  connectionError?: string;
  onlineUsers: OnlineUser[];
  saveStatus: string;
  lastSaved?: Date;
  lastSynced?: Date;
  latency?: number;
  onClose: () => void;
}

const StatusModal: React.FC<StatusModalProps> = ({
  projectId,
  connectionStatus,
  connectionError,
  onlineUsers,
  saveStatus,
  lastSaved,
  lastSynced,
  latency,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'users' | 'activity'>('connection');

  const formatTimestamp = (date?: Date) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢';
      case 'connecting': return '🟡';
      case 'disconnected': return '🔴';
      default: return '⚪';
    }
  };

  const handleReconnect = () => {
    // Trigger reconnection logic
    window.location.reload();
  };

  return (
    <div className="status-modal-overlay" onClick={onClose}>
      <div className="status-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔍 System Status</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab ${activeTab === 'connection' ? 'active' : ''}`}
            onClick={() => setActiveTab('connection')}
          >
            📡 Connection
          </button>
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users ({onlineUsers.length})
          </button>
          <button 
            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            📋 Activity
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'connection' && (
            <div className="connection-tab">
              <div className="status-item">
                <span className="status-label">WebSocket Status:</span>
                <span className="status-value">
                  {getConnectionStatusIcon()} {connectionStatus.toUpperCase()}
                </span>
              </div>

              <div className="status-item">
                <span className="status-label">Project ID:</span>
                <span className="status-value">{projectId}</span>
              </div>

              {latency && (
                <div className="status-item">
                  <span className="status-label">Latency:</span>
                  <span className="status-value">{latency}ms</span>
                </div>
              )}

              <div className="status-item">
                <span className="status-label">Last Heartbeat:</span>
                <span className="status-value">{formatTimestamp(lastSynced)}</span>
              </div>

              <div className="status-item">
                <span className="status-label">Save Status:</span>
                <span className="status-value">{saveStatus.toUpperCase()}</span>
              </div>

              <div className="status-item">
                <span className="status-label">Last Saved:</span>
                <span className="status-value">{formatTimestamp(lastSaved)}</span>
              </div>

              {connectionError && (
                <div className="error-section">
                  <h4>🚨 Connection Error</h4>
                  <p className="error-message">{connectionError}</p>
                </div>
              )}

              <div className="action-buttons">
                <button 
                  className="reconnect-button"
                  onClick={handleReconnect}
                  disabled={connectionStatus === 'connected'}
                >
                  🔄 Reconnect
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              {onlineUsers.length === 0 ? (
                <div className="no-users-message">
                  <p>👤 You are the only user online</p>
                </div>
              ) : (
                <div className="users-list">
                  {onlineUsers.map((user, index) => (
                    <div key={index} className="user-card">
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                        <div className="user-joined">
                          Joined: {formatTimestamp(user.joinedAt)}
                        </div>
                      </div>
                      <div className="user-status">
                        {user.isEditing && (
                          <div className="editing-status">
                            ✏️ Editing: {user.editingTask}
                          </div>
                        )}
                        <div className="online-indicator">🟢 Online</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-tab">
              <div className="activity-header">
                <h4>📋 Recent Activity</h4>
                <button className="refresh-button">🔄</button>
              </div>
              
              <div className="activity-log">
                <div className="activity-item">
                  <span className="activity-time">2 minutes ago</span>
                  <span className="activity-text">Alice created "New Task"</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">5 minutes ago</span>
                  <span className="activity-text">Bob updated "Project Planning"</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">8 minutes ago</span>
                  <span className="activity-text">You joined the project</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusModal;