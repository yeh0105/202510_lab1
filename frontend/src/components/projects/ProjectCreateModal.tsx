import React, { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({ isOpen, onClose }) => {
  const { createProject, isLoading, error, clearError } = useProject();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    // Client-side validation
    if (formData.name.trim().length < 3) {
      setValidationError('Project name must be at least 3 characters long');
      return;
    }

    if (formData.name.trim().length > 50) {
      setValidationError('Project name must be 50 characters or less');
      return;
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.name.trim())) {
      setValidationError('Project name can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }

    try {
      await createProject({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      });
      
      // Reset form and close modal
      setFormData({ name: '', description: '' });
      onClose();
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setValidationError('');
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          minWidth: '400px',
          maxWidth: '500px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Create New Project</h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Enter project name"
              required
              maxLength={50}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              3-50 characters, letters, numbers, spaces, hyphens, and underscores only
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder="Enter project description"
              maxLength={500}
            />
          </div>

          {(validationError || error) && (
            <div
              style={{
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '4px',
                padding: '10px',
                color: '#c00',
                fontSize: '14px',
                marginBottom: '16px'
              }}
            >
              {validationError || error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreateModal;