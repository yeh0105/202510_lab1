import React, { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useWBS } from '../../contexts/WBSContext';

interface StatusIndicatorMicroProps {
  projectId: string;
  showTooltips?: boolean;
  className?: string;
}

export const StatusIndicatorMicro: React.FC<StatusIndicatorMicroProps> = ({ 
  projectId, 
  showTooltips = true,
  className = '' 
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  const { 
    connectionStatus, 
    onlineUsers, 
    latency 
  } = useWebSocket(projectId);
  
  const { 
    saveStatus, 
    lastSaved, 
    pendingChanges 
  } = useWBS();

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

  const getSaveIcon = () => {
    switch (saveStatus) {
      case 'saved': return '💾';
      case 'saving': return '⏳';
      case 'error': return '❌';
      case 'pending': return '📝';
      default: return '❓';
    }
  };

  const getSaveColor = () => {
    switch (saveStatus) {
      case 'saved': return '#10B981';
      case 'saving': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'pending': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    const diff = Math.floor((Date.now() - lastSaved.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  const showTooltip = (type: string) => {
    if (showTooltips) {
      setActiveTooltip(type);
    }
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  return (
    <div className={`status-indicators-micro ${className}`} style={{ 
      display: 'flex', 
      gap: '12px', 
      alignItems: 'center',
      fontSize: '16px'
    }}>
      {/* Connection Status */}
      <div 
        className="status-icon-micro"
        onMouseEnter={() => showTooltip('connection')}
        onMouseLeave={hideTooltip}
        style={{ 
          color: getConnectionColor(),
          cursor: 'pointer',
          position: 'relative',
          padding: '4px',
          borderRadius: '4px',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => {
          (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseOut={(e) => {
          (e.target as HTMLElement).style.backgroundColor = 'transparent';
        }}
      >
        {getConnectionIcon()}
        {activeTooltip === 'connection' && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1001,
            pointerEvents: 'none'
          }}>
            Connection: {connectionStatus}
            {latency && ` (${latency}ms)`}
          </div>
        )}
      </div>

      {/* Online Users */}
      <div 
        className="status-icon-micro"
        onMouseEnter={() => showTooltip('users')}
        onMouseLeave={hideTooltip}
        style={{ 
          color: '#3B82F6',
          cursor: 'pointer',
          position: 'relative',
          padding: '4px',
          borderRadius: '4px',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => {
          (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseOut={(e) => {
          (e.target as HTMLElement).style.backgroundColor = 'transparent';
        }}
      >
        👥
        {activeTooltip === 'users' && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1001,
            pointerEvents: 'none'
          }}>
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

      {/* Save Status */}
      <div 
        className="status-icon-micro"
        onMouseEnter={() => showTooltip('save')}
        onMouseLeave={hideTooltip}
        style={{ 
          color: getSaveColor(),
          cursor: 'pointer',
          position: 'relative',
          padding: '4px',
          borderRadius: '4px',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => {
          (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseOut={(e) => {
          (e.target as HTMLElement).style.backgroundColor = 'transparent';
        }}
      >
        {getSaveIcon()}
        {activeTooltip === 'save' && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1001,
            pointerEvents: 'none'
          }}>
            {saveStatus === 'pending' ? `${pendingChanges} changes pending` : 
             saveStatus === 'saving' ? 'Saving changes...' :
             saveStatus === 'error' ? 'Save failed' :
             saveStatus === 'saved' ? `Saved ${formatLastSaved()}` : 'Unknown status'}
          </div>
        )}
      </div>
    </div>
  );
};