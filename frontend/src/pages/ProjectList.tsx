import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import ProjectCreateModal from '../components/projects/ProjectCreateModal';

const ProjectList: React.FC = () => {
  const { projects, currentProject, selectProject, isLoading, error, loadProjects } = useProject();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleRefresh = () => {
    loadProjects();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>My Projects</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleRefresh}
            style={{
              padding: '10px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            + Create Project
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            padding: '12px',
            color: '#c00',
            marginBottom: '20px'
          }}
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            color: '#666'
          }}
        >
          <h3 style={{ margin: '0 0 12px 0' }}>No projects yet</h3>
          <p style={{ margin: '0 0 20px 0' }}>Create your first project to get started</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {projects.map((project) => (
            <div
              key={project.project_id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: currentProject?.project_id === project.project_id ? '#f0f8ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => selectProject(project)}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                    {project.name}
                    {currentProject?.project_id === project.project_id && (
                      <span
                        style={{
                          marginLeft: '12px',
                          fontSize: '12px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        CURRENT
                      </span>
                    )}
                  </h3>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
                    <span>
                      <strong>Permission:</strong> {project.permission}
                    </span>
                    <span>
                      <strong>Last Modified:</strong> {new Date(project.last_modified).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  ID: {project.project_id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default ProjectList;