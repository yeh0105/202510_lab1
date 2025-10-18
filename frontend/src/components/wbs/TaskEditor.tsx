import React, { useState } from 'react';
import { useWBS, WBSTask, WBSTaskUpdateData } from '../../contexts/WBSContext';

interface TaskEditorProps {
  projectId: string;
  task: WBSTask;
  onTaskUpdated?: () => void;
  onCancel?: () => void;
  isInline?: boolean;
}

const TaskEditor: React.FC<TaskEditorProps> = ({
  projectId,
  task,
  onTaskUpdated,
  onCancel,
  isInline = false
}) => {
  const { updateTask, isLoading, error, clearError } = useWBS();
  const [formData, setFormData] = useState<WBSTaskUpdateData>({
    description: task.description,
    owner: task.owner || '',
    start_date: task.start_date || '',
    finish_date: task.finish_date || '',
    complexity: task.complexity,
    progress: task.progress,
    notes: task.notes || ''
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof WBSTaskUpdateData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Check if there are changes
    const changed = 
      newFormData.description !== task.description ||
      (newFormData.owner || '') !== (task.owner || '') ||
      (newFormData.start_date || '') !== (task.start_date || '') ||
      (newFormData.finish_date || '') !== (task.finish_date || '') ||
      newFormData.complexity !== task.complexity ||
      newFormData.progress !== task.progress ||
      (newFormData.notes || '') !== (task.notes || '');
    
    setHasChanges(changed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!hasChanges) {
      onCancel?.();
      return;
    }

    try {
      // Prepare update data, only include changed fields
      const updateData: WBSTaskUpdateData = {};
      
      if (formData.description !== task.description) {
        updateData.description = formData.description;
      }
      if ((formData.owner || '') !== (task.owner || '')) {
        updateData.owner = formData.owner?.trim() || undefined;
      }
      if ((formData.start_date || '') !== (task.start_date || '')) {
        updateData.start_date = formData.start_date || undefined;
      }
      if ((formData.finish_date || '') !== (task.finish_date || '')) {
        updateData.finish_date = formData.finish_date || undefined;
      }
      if (formData.complexity !== task.complexity) {
        updateData.complexity = formData.complexity;
      }
      if (formData.progress !== task.progress) {
        updateData.progress = formData.progress;
      }
      if ((formData.notes || '') !== (task.notes || '')) {
        updateData.notes = formData.notes?.trim() || undefined;
      }

      await updateTask(projectId, task.id, updateData);
      onTaskUpdated?.();
    } catch (err) {
      // Error is handled by the context
    }
  };

  const handleCancel = () => {
    clearError();
    setFormData({
      description: task.description,
      owner: task.owner || '',
      start_date: task.start_date || '',
      finish_date: task.finish_date || '',
      complexity: task.complexity,
      progress: task.progress,
      notes: task.notes || ''
    });
    setHasChanges(false);
    onCancel?.();
  };

  const formStyle = isInline ? {
    padding: '12px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    marginBottom: '8px'
  } : {
    padding: '20px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '8px 12px',
          borderRadius: '4px',
          marginBottom: '12px',
          border: '1px solid #fcc',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Task metadata info */}
      <div style={{
        fontSize: '12px',
        color: '#6b7280',
        marginBottom: '12px',
        padding: '8px',
        backgroundColor: '#f9fafb',
        borderRadius: '4px'
      }}>
        <div>Task ID: {task.id}</div>
        <div>Created by: {task.creator} on {new Date(task.created_at).toLocaleDateString()}</div>
        {task.last_editor && task.last_edited_at && (
          <div>
            Last edited by: {task.last_editor} on {new Date(task.last_edited_at).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Description - Required */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '4px'
        }}>
          Task Description *
        </label>
        <input
          type="text"
          required
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          maxLength={200}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Owner */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Owner
          </label>
          <input
            type="email"
            value={formData.owner}
            onChange={(e) => handleChange('owner', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            placeholder="owner@example.com"
          />
        </div>

        {/* Complexity */}
        <div style={{ flex: '0 0 120px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Complexity
          </label>
          <select
            value={formData.complexity}
            onChange={(e) => handleChange('complexity', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        {/* Progress */}
        <div style={{ flex: '0 0 120px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Progress (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => handleChange('progress', parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Dates */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Start Date
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Finish Date
          </label>
          <input
            type="date"
            value={formData.finish_date}
            onChange={(e) => handleChange('finish_date', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginTop: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '4px'
        }}>
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          maxLength={1000}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
        justifyContent: 'flex-end'
      }}>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            color: '#374151',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.description?.trim() || !hasChanges}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 
              isLoading || !formData.description?.trim() || !hasChanges 
                ? '#9ca3af' 
                : '#10b981',
            color: 'white',
            fontSize: '14px',
            cursor: 
              isLoading || !formData.description?.trim() || !hasChanges 
                ? 'not-allowed' 
                : 'pointer'
          }}
        >
          {isLoading ? 'Updating...' : hasChanges ? 'Update Task' : 'No Changes'}
        </button>
      </div>
    </form>
  );
};

export default TaskEditor;