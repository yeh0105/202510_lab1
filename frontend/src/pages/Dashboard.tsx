import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { WBSProvider } from '../contexts/WBSContext';
import ProjectCreateModal from '../components/projects/ProjectCreateModal';
import WBSTreeView from '../components/wbs/WBSTreeView';
import { WBSStatusIndicator } from '../components/status/WBSStatusIndicator';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentProject, projects } = useProject();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div style={{
      padding: '0', // Remove padding to use full viewport
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Main Content Area - Now takes 85% of space */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        overflow: 'auto'
      }}>
        {currentProject ? (
          <WBSProvider>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Context Bar for WBS - Now inside WBSProvider */}
              <div style={{
                backgroundColor: '#ecf0f1',
                borderBottom: '1px solid #bdc3c7',
                height: '36px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 24px',
                flexShrink: 0
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#2c3e50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  Work Breakdown Structure - {currentProject.name}
                  <span style={{
                    fontSize: '13px',
                    color: '#7f8c8d',
                    fontWeight: 400
                  }}>
                    ({currentProject.permission}) • Last Modified: {new Date(currentProject.last_modified).toLocaleDateString()}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center'
                }}>
                  <WBSStatusIndicator />
                  <button
                    style={{
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = '#2980b9';
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = '#3498db';
                    }}
                  >
                    + Add Root Task
                  </button>
                </div>
              </div>
              
              {/* WBS Tree View */}
              <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
                <WBSTreeView />
              </div>
            </div>
          </WBSProvider>
        ) : (
          <div style={{
            backgroundColor: '#fff3cd',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #ffeaa7',
            maxWidth: '600px',
            margin: '2rem auto'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '1rem' }}>No Project Selected</h3>
            {projects.length === 0 ? (
              <div>
                <p style={{ color: '#856404', marginBottom: '1.5rem' }}>
                  You don't have any projects yet. Create your first project to get started.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 500
                  }}
                >
                  Create First Project
                </button>
              </div>
            ) : (
              <p style={{ color: '#856404' }}>
                Please select a project from the header dropdown to continue.
              </p>
            )}
          </div>
        )}

        {/* User Information - Moved to bottom right corner */}
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#f8f9fa',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#6c757d',
          border: '1px solid #dee2e6',
          maxWidth: '200px',
          zIndex: 100
        }}>
          <div><strong>User:</strong> {user?.email?.split('@')[0]}</div>
          <div><strong>Role:</strong> {user?.role}</div>
          <div><strong>Projects:</strong> {projects.length}</div>
        </div>
      </div>

      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;