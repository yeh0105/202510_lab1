import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface Project {
  project_id: string;
  name: string;
  permission: 'Read' | 'Edit' | 'Manage';
  last_modified: string;
}

export interface ProjectCreateData {
  name: string;
  description?: string;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  createProject: (data: ProjectCreateData) => Promise<Project>;
  selectProject: (project: Project) => void;
  clearError: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const { token, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use token from AuthContext instead of localStorage directly
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/projects/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load projects');
      }

      const projectList: Project[] = await response.json();
      setProjects(projectList);
      
      // Auto-select first project if none selected
      setCurrentProject(prev => {
        if (!prev && projectList.length > 0) {
          return projectList[0];
        }
        return prev;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createProject = async (data: ProjectCreateData): Promise<Project> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use token from AuthContext instead of localStorage directly
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/projects/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create project');
      }

      const responseData = await response.json();
      const newProject: Project = {
        project_id: responseData.project_id,
        name: responseData.name,
        permission: responseData.permission,
        last_modified: responseData.last_modified || new Date().toISOString()
      };
      
      // Add to projects list
      setProjects(prev => [newProject, ...prev]);
      
      // Auto-select the new project
      setCurrentProject(newProject);
      
      return newProject;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create project';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const selectProject = (project: Project) => {
    setCurrentProject(project);
    localStorage.setItem('currentProjectId', project.project_id);
  };

  const clearError = () => {
    setError(null);
  };

  // Load projects only when authentication is ready and token is available
  useEffect(() => {
    if (!authLoading && token) {
      loadProjects();
    }
  }, [authLoading, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore selected project from localStorage
  useEffect(() => {
    const savedProjectId = localStorage.getItem('currentProjectId');
    if (savedProjectId && projects.length > 0) {
      const savedProject = projects.find(p => p.project_id === savedProjectId);
      if (savedProject) {
        setCurrentProject(savedProject);
      }
    }
  }, [projects]);

  const value: ProjectContextType = {
    projects,
    currentProject,
    isLoading,
    error,
    loadProjects,
    createProject,
    selectProject,
    clearError,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};