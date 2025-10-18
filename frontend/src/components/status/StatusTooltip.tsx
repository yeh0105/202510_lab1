import React from 'react';
import { OnlineUser } from '../../types/collaboration';
import './StatusTooltip.css';

interface StatusTooltipProps {
  connectionStatus: string;
  onlineUsers: OnlineUser[];
  saveStatus: string;
  lastSaved: string;
  latency?: number;
  lastSynced?: Date;
}

const StatusTooltip: React.FC<StatusTooltipProps> = ({
  connectionStatus,
  onlineUsers,
  saveStatus,
  lastSaved,
  latency,
  lastSynced
}) => {
  const formatSyncTime = () => {
    if (!lastSynced) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSynced.getTime()) / 1000);
    
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <div className="status-tooltip">
      <div className="tooltip-section">
        <div className="tooltip-header">📡 Connection</div>
        <div className="tooltip-content">
          <div>{connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}</div>
          {latency && <div className="latency">Latency: {latency}ms</div>}
        </div>
      </div>

      <div className="tooltip-section">
        <div className="tooltip-header">👥 Online Users</div>
        <div className="tooltip-content">
          {onlineUsers.length === 0 ? (
            <div className="no-users">Just you</div>
          ) : (
            <div className="users-list">
              {onlineUsers.slice(0, 3).map((user, index) => (
                <div key={index} className="user-item">
                  <span className="user-name">{user.name}</span>
                  {user.isEditing && (
                    <span className="editing-indicator">✏️</span>
                  )}
                </div>
              ))}
              {onlineUsers.length > 3 && (
                <div className="more-users">+{onlineUsers.length - 3} more</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="tooltip-section">
        <div className="tooltip-header">💾 Save Status</div>
        <div className="tooltip-content">
          <div>Status: {saveStatus}</div>
          <div>Last saved: {lastSaved}</div>
          <div>Last sync: {formatSyncTime()}</div>
        </div>
      </div>

      <div className="tooltip-footer">
        Click for detailed information
      </div>
    </div>
  );
};

export default StatusTooltip;