import React from 'react';
import { useProject } from '../../contexts/ProjectContext';
import './Header.css';

interface ContextBarProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showProjectInfo?: boolean;
}

export const ContextBar: React.FC<ContextBarProps> = ({ 
  title, 
  subtitle, 
  actions, 
  showProjectInfo = true 
}) => {
  const { currentProject } = useProject();

  // Default title and subtitle based on current project
  const displayTitle = title || (currentProject ? `Work Breakdown Structure - ${currentProject.name}` : 'Work Breakdown Structure');
  const displaySubtitle = subtitle || (currentProject ? `(${currentProject.permission})` : '');

  return (
    <div className="context-bar">
      <div className="context-title">
        {displayTitle}
        {displaySubtitle && (
          <span className="context-project-info">
            {displaySubtitle}
          </span>
        )}
        {showProjectInfo && currentProject && (
          <span className="context-project-info">
            • Last Modified: {new Date(currentProject.last_modified).toLocaleDateString()}
          </span>
        )}
      </div>
      
      {actions && (
        <div className="context-actions">
          {actions}
        </div>
      )}
    </div>
  );
};