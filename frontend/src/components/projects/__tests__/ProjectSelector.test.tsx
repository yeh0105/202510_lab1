import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectSelector from '../ProjectSelector';
import { ProjectProvider } from '../../../contexts/ProjectContext';

// Mock the useProject hook
const mockUseProject = {
  projects: [
    {
      project_id: 'proj_1',
      name: 'Test Project 1',
      permission: 'Manage' as const,
      last_modified: '2025-08-01T10:00:00Z'
    },
    {
      project_id: 'proj_2',
      name: 'Test Project 2',
      permission: 'Edit' as const,
      last_modified: '2025-08-01T11:00:00Z'
    }
  ],
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

describe('ProjectSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders select project button when no project selected', () => {
    render(<ProjectSelector />);
    expect(screen.getByText('Select Project')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    const loadingMock = { ...mockUseProject, isLoading: true };
    jest.mocked(require('../../../contexts/ProjectContext').useProject).mockReturnValue(loadingMock);
    
    render(<ProjectSelector />);
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  test('displays current project when selected', () => {
    const withCurrentProject = {
      ...mockUseProject,
      currentProject: mockUseProject.projects[0]
    };
    jest.mocked(require('../../../contexts/ProjectContext').useProject).mockReturnValue(withCurrentProject);
    
    render(<ProjectSelector />);
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Permission: Manage')).toBeInTheDocument();
  });

  test('opens dropdown when clicked', () => {
    render(<ProjectSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
  });

  test('calls selectProject when project is clicked', () => {
    render(<ProjectSelector />);
    
    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Click on first project
    fireEvent.click(screen.getByText('Test Project 1'));
    
    expect(mockUseProject.selectProject).toHaveBeenCalledWith(mockUseProject.projects[0]);
  });

  test('shows no projects message when empty', () => {
    const emptyMock = { ...mockUseProject, projects: [] };
    jest.mocked(require('../../../contexts/ProjectContext').useProject).mockReturnValue(emptyMock);
    
    render(<ProjectSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('No projects available')).toBeInTheDocument();
  });
});