import React, { useState, useEffect } from 'react';
import { useWBS, WBSTask } from '../../contexts/WBSContext';
import { useProject } from '../../contexts/ProjectContext';
import ProgressBar from './ProgressBar';
import TaskCreator from './TaskCreator';
import TaskEditor from './TaskEditor';

interface WBSTreeViewProps {
  className?: string;
}

interface TaskRowProps {
  task: WBSTask;
  projectId: string;
  level: number;
  isLast: boolean;
  parentPrefix: string;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  projectId,
  level,
  isLast,
  parentPrefix
}) => {
  const { 
    expandedTasks, 
    toggleTaskExpansion, 
    deleteTask,
    isLoading,
    error 
  } = useWBS();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateChild, setShowCreateChild] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isExpanded = expandedTasks.has(task.id);
  const hasChildren = task.children.length > 0;
  const isLeaf = !hasChildren;
  const isBranch = hasChildren;

  // Create indentation prefix for tree structure
  const treePrefix = parentPrefix + (isLast ? '└── ' : '├── ');
  const childPrefix = parentPrefix + (isLast ? '    ' : '│   ');

  const handleDelete = async () => {
    try {
      await deleteTask(projectId, task.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      // Error handled by context
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 3) return '#22c55e'; // green
    if (complexity <= 6) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  return (
    <>
      {/* Task Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        borderBottom: '1px solid #f3f4f6',
        backgroundColor: isBranch ? '#fafafa' : 'white',
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        {/* Tree Structure & Toggle */}
        <div style={{
          minWidth: `${level * 20 + 150}px`,
          display: 'flex',
          alignItems: 'center',
          color: '#6b7280',
          fontFamily: 'monospace'
        }}>
          <span>{treePrefix}</span>
          {hasChildren && (
            <button
              onClick={() => toggleTaskExpansion(task.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                marginLeft: '4px',
                color: '#3b82f6',
                fontSize: '12px'
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </div>

        {/* Task Description */}
        <div style={{
          flex: '2',
          minWidth: '200px',
          fontWeight: isBranch ? '600' : '400',
          color: isBranch ? '#1f2937' : '#374151'
        }}>
          {task.description}
          {isBranch && (
            <span style={{
              marginLeft: '8px',
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '400'
            }}>
              ({task.children.length} subtasks)
            </span>
          )}
        </div>

        {/* Owner */}
        <div style={{
          flex: '1',
          minWidth: '120px',
          color: '#6b7280',
          fontSize: '13px'
        }}>
          {task.owner || '-'}
        </div>

        {/* Dates */}
        <div style={{
          flex: '1',
          minWidth: '100px',
          color: '#6b7280',
          fontSize: '13px'
        }}>
          {formatDate(task.start_date)}
        </div>
        <div style={{
          flex: '1',
          minWidth: '100px',
          color: '#6b7280',
          fontSize: '13px'
        }}>
          {formatDate(task.finish_date)}
        </div>

        {/* Complexity */}
        <div style={{
          flex: '0 0 80px',
          textAlign: 'center'
        }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: getComplexityColor(task.complexity),
            color: 'white',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {task.complexity}
          </span>
        </div>

        {/* Progress */}
        <div style={{
          flex: '0 0 120px',
          padding: '0 8px'
        }}>
          <ProgressBar progress={task.progress} width={80} height={14} />
        </div>

        {/* Actions */}
        <div style={{
          flex: '0 0 120px',
          display: 'flex',
          gap: '4px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="Edit task"
          >
            Edit
          </button>
          <button
            onClick={() => setShowCreateChild(true)}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#f0f9ff',
              color: '#1d4ed8',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="Add child task"
          >
            +Child
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '4px 8px',
              border: '1px solid #fca5a5',
              borderRadius: '4px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Task Editor */}
      {isEditing && (
        <div style={{ padding: '0 16px' }}>
          <TaskEditor
            projectId={projectId}
            task={task}
            isInline={true}
            onTaskUpdated={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}

      {/* Child Task Creator */}
      {showCreateChild && (
        <div style={{ padding: '0 16px' }}>
          <TaskCreator
            projectId={projectId}
            parentId={task.id}
            isInline={true}
            onTaskCreated={() => setShowCreateChild(false)}
            onCancel={() => setShowCreateChild(false)}
          />
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '400px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#dc2626' }}>
              Delete Task
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#374151' }}>
              Are you sure you want to delete "{task.description}" and all its subtasks?
              {hasChildren && (
                <span style={{ color: '#dc2626', fontWeight: '600' }}>
                  <br />This will delete {task.children.length} subtask(s).
                </span>
              )}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Children */}
      {hasChildren && isExpanded && (
        <>
          {task.children.map((child, index) => (
            <TaskRow
              key={child.id}
              task={child}
              projectId={projectId}
              level={level + 1}
              isLast={index === task.children.length - 1}
              parentPrefix={childPrefix}
            />
          ))}
        </>
      )}
    </>
  );
};

const WBSTreeView: React.FC<WBSTreeViewProps> = ({ className = '' }) => {
  const { currentProject } = useProject();
  const { wbsData, loadWBS, isLoading, error, clearError } = useWBS();
  const [showCreateRoot, setShowCreateRoot] = useState(false);

  useEffect(() => {
    if (currentProject) {
      loadWBS(currentProject.project_id);
    }
  }, [currentProject, loadWBS]);

  if (!currentProject) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
        Please select a project to view WBS
      </div>
    );
  }

  return (
    <div className={`wbs-tree-view ${className}`} style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#1f2937' }}>
            Work Breakdown Structure
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Project: {currentProject.name}
          </p>
        </div>
        <button
          onClick={() => setShowCreateRoot(true)}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          + Add Root Task
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #fcc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              color: '#c33',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Root Task Creator */}
      {showCreateRoot && (
        <div style={{ marginBottom: '20px' }}>
          <TaskCreator
            projectId={currentProject.project_id}
            onTaskCreated={() => setShowCreateRoot(false)}
            onCancel={() => setShowCreateRoot(false)}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280'
        }}>
          Loading WBS data...
        </div>
      )}

      {/* WBS Table */}
      {!isLoading && wbsData && (
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f9fafb',
            padding: '12px 8px',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            <div style={{ minWidth: '250px' }}>Task</div>
            <div style={{ flex: '1', minWidth: '120px' }}>Owner</div>
            <div style={{ flex: '1', minWidth: '100px' }}>Start Date</div>
            <div style={{ flex: '1', minWidth: '100px' }}>Finish Date</div>
            <div style={{ flex: '0 0 80px', textAlign: 'center' }}>Complexity</div>
            <div style={{ flex: '0 0 120px', textAlign: 'center' }}>Progress</div>
            <div style={{ flex: '0 0 120px', textAlign: 'center' }}>Actions</div>
          </div>

          {/* Task Rows */}
          {wbsData.root_tasks.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              No tasks in this project yet. Click "Add Root Task" to get started.
            </div>
          ) : (
            wbsData.root_tasks.map((task, index) => (
              <TaskRow
                key={task.id}
                task={task}
                projectId={currentProject.project_id}
                level={0}
                isLast={index === wbsData.root_tasks.length - 1}
                parentPrefix=""
              />
            ))
          )}
        </div>
      )}

      {/* Summary Info */}
      {!isLoading && wbsData && wbsData.root_tasks.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div>Last modified: {new Date(wbsData.last_modified).toLocaleString()}</div>
          <div>Total root tasks: {wbsData.root_tasks.length}</div>
        </div>
      )}
    </div>
  );
};

export default WBSTreeView;