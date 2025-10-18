import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { SaveStatus } from '../types/collaboration';

export interface WBSTask {
  id: string;
  description: string;
  owner?: string;
  start_date?: string;
  finish_date?: string;
  complexity: number;
  progress: number;
  notes: string;
  creator: string;
  created_at: string;
  last_editor?: string;
  last_edited_at?: string;
  parent_id?: string;
  children: WBSTask[];
}

export interface WBSData {
  project_id: string;
  version: number;
  last_modified: string;
  root_tasks: WBSTask[];
}

export interface WBSTaskCreateData {
  description: string;
  parent_id?: string;
  owner?: string;
  start_date?: string;
  finish_date?: string;
  complexity?: number;
  progress?: number;
  notes?: string;
}

export interface WBSTaskUpdateData {
  description?: string;
  owner?: string;
  start_date?: string;
  finish_date?: string;
  complexity?: number;
  progress?: number;
  notes?: string;
}

interface WBSContextType {
  wbsData: WBSData | null;
  isLoading: boolean;
  error: string | null;
  loadWBS: (projectId: string) => Promise<void>;
  createTask: (projectId: string, taskData: WBSTaskCreateData) => Promise<WBSTask>;
  updateTask: (projectId: string, taskId: string, updateData: WBSTaskUpdateData) => Promise<WBSTask>;
  deleteTask: (projectId: string, taskId: string) => Promise<any>;
  clearError: () => void;
  expandedTasks: Set<string>;
  toggleTaskExpansion: (taskId: string) => void;
  saveStatus: string;
  lastSaved?: Date;
  lastSynced?: Date;
  pendingChanges: number;
}

const WBSContext = createContext<WBSContextType | undefined>(undefined);

interface WBSProviderProps {
  children: ReactNode;
}

export const WBSProvider: React.FC<WBSProviderProps> = ({ children }) => {
  const { token } = useAuth();
  const [wbsData, setWbsData] = useState<WBSData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<string>('idle');
  const [lastSaved, setLastSaved] = useState<Date>();
  const [lastSynced, setLastSynced] = useState<Date>();
  const [pendingChanges, setPendingChanges] = useState<number>(0);

  const loadWBS = useCallback(async (projectId: string) => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/projects/${projectId}/wbs/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load WBS data');
      }

      const data: WBSData = await response.json();
      setWbsData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load WBS data');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createTask = useCallback(async (projectId: string, taskData: WBSTaskCreateData): Promise<WBSTask> => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    setIsLoading(true);
    setError(null);
    setSaveStatus('saving');
    setPendingChanges(prev => prev + 1);

    try {
      const response = await fetch(`http://localhost:8000/projects/${projectId}/wbs/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create task');
      }

      const newTask: WBSTask = await response.json();
      
      // Reload WBS data to get updated calculations
      await loadWBS(projectId);
      
      // Update save status
      setSaveStatus('saved');
      setLastSaved(new Date());
      setLastSynced(new Date());
      setPendingChanges(prev => Math.max(0, prev - 1));
      
      return newTask;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create task';
      setError(errorMsg);
      setSaveStatus('error');
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [token, loadWBS]);

  const updateTask = useCallback(async (projectId: string, taskId: string, updateData: WBSTaskUpdateData): Promise<WBSTask> => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    setIsLoading(true);
    setError(null);
    setSaveStatus('saving');
    setPendingChanges(prev => prev + 1);

    try {
      const response = await fetch(`http://localhost:8000/projects/${projectId}/wbs/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update task');
      }

      const updatedTask: WBSTask = await response.json();
      
      // Reload WBS data to get updated calculations
      await loadWBS(projectId);
      
      // Update save status
      setSaveStatus('saved');
      setLastSaved(new Date());
      setLastSynced(new Date());
      setPendingChanges(prev => Math.max(0, prev - 1));
      
      return updatedTask;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update task';
      setError(errorMsg);
      setSaveStatus('error');
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [token, loadWBS]);

  const deleteTask = useCallback(async (projectId: string, taskId: string) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    setIsLoading(true);
    setError(null);
    setSaveStatus('saving');
    setPendingChanges(prev => prev + 1);

    try {
      const response = await fetch(`http://localhost:8000/projects/${projectId}/wbs/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete task');
      }

      const result = await response.json();
      
      // Reload WBS data to get updated structure
      await loadWBS(projectId);
      
      // Update save status
      setSaveStatus('saved');
      setLastSaved(new Date());
      setLastSynced(new Date());
      setPendingChanges(prev => Math.max(0, prev - 1));
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete task';
      setError(errorMsg);
      setSaveStatus('error');
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [token, loadWBS]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const toggleTaskExpansion = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const value: WBSContextType = {
    wbsData,
    isLoading,
    error,
    loadWBS,
    createTask,
    updateTask,
    deleteTask,
    clearError,
    expandedTasks,
    toggleTaskExpansion,
    saveStatus,
    lastSaved,
    lastSynced,
    pendingChanges,
  };

  return (
    <WBSContext.Provider value={value}>
      {children}
    </WBSContext.Provider>
  );
};

export const useWBS = (): WBSContextType => {
  const context = useContext(WBSContext);
  if (context === undefined) {
    throw new Error('useWBS must be used within a WBSProvider');
  }
  return context;
};