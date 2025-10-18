import React, { useState } from 'react';
import { useWBS } from '../../contexts/WBSContext';

interface WBSStatusIndicatorProps {
  className?: string;
}

export const WBSStatusIndicator: React.FC<WBSStatusIndicatorProps> = ({ 
  className = '' 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const { 
    saveStatus, 
    lastSaved, 
    pendingChanges 
  } = useWBS();

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

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saved': return `Saved ${formatLastSaved()}`;
      case 'saving': return 'Saving changes...';
      case 'error': return 'Save failed';
      case 'pending': return `${pendingChanges} changes pending`;
      default: return 'Unknown status';
    }
  };

  return (
    <div 
      className={`wbs-status-indicator ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ 
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#2d3748',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <span style={{ color: getSaveColor(), fontSize: '14px' }}>
        {getSaveIcon()}
      </span>
      <span style={{ fontWeight: 500 }}>
        {getStatusText()}
      </span>
      
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 1001,
          pointerEvents: 'none'
        }}>
          WBS Save Status
          {lastSaved && (
            <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.8 }}>
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};