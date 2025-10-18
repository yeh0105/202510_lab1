import React, { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useWBS } from '../../contexts/WBSContext';
import StatusIndicator from './StatusIndicator';
import StatusTooltip from './StatusTooltip';
import StatusModal from './StatusModal';
import './StatusBar.css';

interface StatusBarProps {
  projectId: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ projectId }) => {
  const [showModal, setShowModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const { 
    connectionStatus, 
    onlineUsers, 
    lastHeartbeat,
    connectionError,
    latency 
  } = useWebSocket(projectId);
  
  const { 
    saveStatus, 
    lastSaved, 
    lastSynced,
    pendingChanges 
  } = useWBS();

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10B981'; // green
      case 'connecting': return '#F59E0B'; // yellow
      case 'disconnected': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saved': return '#10B981'; // green
      case 'saving': return '#F59E0B'; // yellow
      case 'error': return '#EF4444'; // red
      case 'pending': return '#8B5CF6'; // purple
      default: return '#6B7280'; // gray
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saved': return 'Saved';
      case 'saving': return 'Saving...';
      case 'error': return 'Error';
      case 'pending': return `${pendingChanges} pending`;
      default: return 'Unknown';
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <>
      <div 
        className="status-bar"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowModal(true)}
      >
        {/* Connection Status */}
        <StatusIndicator
          color={getConnectionColor()}
          icon="🌐"
          text={connectionStatus}
          pulse={connectionStatus === 'connecting'}
        />

        {/* Online Users */}
        <StatusIndicator
          color="#3B82F6"
          icon="👥"
          text={`${onlineUsers.length} online`}
          className="users-indicator"
        />

        {/* Save Status */}
        <StatusIndicator
          color={getSaveStatusColor()}
          icon="💾"
          text={getSaveStatusText()}
          pulse={saveStatus === 'saving'}
        />

        {/* Expand Icon */}
        <div className="status-expand">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M4 6l4 4V2l-4 4z"/>
          </svg>
        </div>
      </div>

      {/* Tooltip on Hover */}
      {showTooltip && (
        <StatusTooltip
          connectionStatus={connectionStatus}
          onlineUsers={onlineUsers}
          saveStatus={saveStatus}
          lastSaved={formatLastSaved()}
          latency={latency}
          lastSynced={lastSynced}
        />
      )}

      {/* Detailed Modal on Click */}
      {showModal && (
        <StatusModal
          projectId={projectId}
          connectionStatus={connectionStatus}
          connectionError={connectionError}
          onlineUsers={onlineUsers}
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          lastSynced={lastSynced}
          latency={latency}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default StatusBar;