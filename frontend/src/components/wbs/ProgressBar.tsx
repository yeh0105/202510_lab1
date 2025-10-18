import React from 'react';

interface ProgressBarProps {
  progress: number;
  width?: number;
  height?: number;
  showPercentage?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  width = 100,
  height = 16,
  showPercentage = true,
  className = ''
}) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Determine colors based on progress
  const getProgressColor = (progress: number): string => {
    if (progress === 0) return '#e5e7eb';
    if (progress < 25) return '#ef4444'; // red
    if (progress < 50) return '#f97316'; // orange
    if (progress < 75) return '#eab308'; // yellow
    if (progress < 100) return '#22c55e'; // green
    return '#16a34a'; // dark green for 100%
  };

  const progressColor = getProgressColor(clampedProgress);

  return (
    <div 
      className={`progress-bar-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%'
      }}
    >
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid #d1d5db',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: `${clampedProgress}%`,
            height: '100%',
            backgroundColor: progressColor,
            transition: 'width 0.3s ease-in-out',
            borderRadius: clampedProgress === 100 ? '3px' : '3px 0 0 3px'
          }}
        />
        {/* Optional overlay text */}
        {showPercentage && height >= 16 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '10px',
              fontWeight: '600',
              color: clampedProgress < 50 ? '#374151' : '#ffffff',
              textShadow: clampedProgress < 50 ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
              pointerEvents: 'none'
            }}
          >
            {clampedProgress}%
          </div>
        )}
      </div>
      {showPercentage && height < 16 && (
        <span
          style={{
            fontSize: '12px',
            color: '#6b7280',
            minWidth: '35px',
            textAlign: 'right'
          }}
        >
          {clampedProgress}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;