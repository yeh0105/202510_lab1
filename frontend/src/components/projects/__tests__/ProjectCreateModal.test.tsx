import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectCreateModal from '../ProjectCreateModal';

// Mock the useProject hook
const mockUseProject = {
  projects: [],
  currentProject: null,
  selectProject: jest.fn(),
  isLoading: false,
  error: null,
  loadProjects: jest.fn(),
  createProject: jest.fn(),
  clearError: jest.fn()
};

jest.mock('../../../contexts/ProjectContext', () => ({
  ...jest.requireActual('../../../contexts/ProjectContext'),
  useProject: () => mockUseProject
}));

describe('ProjectCreateModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders when open', () => {
    render(<ProjectCreateModal {...defaultProps} />);
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter project name')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(<ProjectCreateModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
  });

  test('validates project name length', async () => {
    render(<ProjectCreateModal {...defaultProps} />);
    
    const nameInput = screen.getByPlaceholderText('Enter project name');
    const submitButton = screen.getByText('Create Project');
    
    // Test too short
    fireEvent.change(nameInput, { target: { value: 'AB' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/must be at least 3 characters/)).toBeInTheDocument();
    });
  });

  test('validates project name characters', async () => {
    render(<ProjectCreateModal {...defaultProps} />);
    
    const nameInput = screen.getByPlaceholderText('Enter project name');
    const submitButton = screen.getByText('Create Project');
    
    // Test invalid characters
    fireEvent.change(nameInput, { target: { value: 'Invalid@Name#' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/can only contain letters, numbers/)).toBeInTheDocument();
    });
  });

  test('calls createProject on valid submission', async () => {
    mockUseProject.createProject.mockResolvedValue({
      project_id: 'proj_123',
      name: 'Test Project',
      permission: 'Manage',
      last_modified: new Date().toISOString()
    });

    render(<ProjectCreateModal {...defaultProps} />);
    
    const nameInput = screen.getByPlaceholderText('Enter project name');
    const descInput = screen.getByPlaceholderText('Enter project description');
    const submitButton = screen.getByText('Create Project');
    
    fireEvent.change(nameInput, { target: { value: 'Test Project' } });
    fireEvent.change(descInput, { target: { value: 'Test description' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockUseProject.createProject).toHaveBeenCalledWith({
        name: 'Test Project',
        description: 'Test description'
      });
    });
  });

  test('shows loading state during creation', () => {
    const loadingMock = { ...mockUseProject, isLoading: true };
    jest.mocked(require('../../../contexts/ProjectContext').useProject).mockReturnValue(loadingMock);
    
    render(<ProjectCreateModal {...defaultProps} />);
    
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByText('Creating...')).toBeDisabled();
  });

  test('displays error from context', () => {
    const errorMock = { ...mockUseProject, error: 'Project name already exists' };
    jest.mocked(require('../../../contexts/ProjectContext').useProject).mockReturnValue(errorMock);
    
    render(<ProjectCreateModal {...defaultProps} />);
    
    expect(screen.getByText('Project name already exists')).toBeInTheDocument();
  });

  test('closes modal on cancel', () => {
    render(<ProjectCreateModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('closes modal on backdrop click', () => {
    render(<ProjectCreateModal {...defaultProps} />);
    
    // Click on backdrop (the overlay div)
    const backdrop = screen.getByText('Create New Project').closest('[style*="position: fixed"]');
    fireEvent.click(backdrop!);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});