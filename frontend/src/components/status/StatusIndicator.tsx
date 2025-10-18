import React from 'react';
import './StatusIndicator.css';

interface StatusIndicatorProps {
  color: string;
  icon: string;
  text: string;
  pulse?: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  color,
  icon,
  text,
  pulse = false,
  className = ''
}) => {
  return (
    <div className={`status-indicator ${className}`}>
      <div 
        className={`status-dot ${pulse ? 'pulse' : ''}`}
        style={{ backgroundColor: color }}
      >
        <span className="status-icon" role="img" aria-label={text}>
          {icon}
        </span>
      </div>
      <span className="status-text">{text}</span>
    </div>
  );
};

export default StatusIndicator;