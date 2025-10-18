import React, { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';

const ProjectSelector: React.FC = () => {
  const { projects, currentProject, selectProject, isLoading } = useProject();
  const [isOpen, setIsOpen] = useState(false);

  const handleProjectSelect = (project: any) => {
    selectProject(project);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '8px 16px', color: '#666' }}>
        Loading projects...
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          backgroundColor: 'white',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {currentProject ? currentProject.name : 'Select Project'}
          </div>
          {currentProject && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Permission: {currentProject.permission}
            </div>
          )}
        </div>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {projects.length === 0 ? (
            <div style={{ padding: '16px', color: '#666', textAlign: 'center' }}>
              No projects available
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.project_id}
                onClick={() => handleProjectSelect(project)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  backgroundColor: currentProject?.project_id === project.project_id ? '#f0f8ff' : 'white'
                }}
                onMouseEnter={(e) => {
                  if (currentProject?.project_id !== project.project_id) {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentProject?.project_id !== project.project_id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {project.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {project.permission} • Last modified: {new Date(project.last_modified).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;