import React, { useState } from 'react';
import { useWBS, WBSTaskCreateData } from '../../contexts/WBSContext';

interface TaskCreatorProps {
  projectId: string;
  parentId?: string;
  onTaskCreated?: () => void;
  onCancel?: () => void;
  isInline?: boolean;
}

const TaskCreator: React.FC<TaskCreatorProps> = ({
  projectId,
  parentId,
  onTaskCreated,
  onCancel,
  isInline = false
}) => {
  const { createTask, isLoading, error, clearError } = useWBS();
  const [formData, setFormData] = useState<WBSTaskCreateData>({
    description: '',
    parent_id: parentId,
    owner: '',
    start_date: '',
    finish_date: '',
    complexity: 3,
    progress: 0,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      // Clean up empty string values
      const taskData: WBSTaskCreateData = {
        description: formData.description,
        parent_id: parentId,
        complexity: formData.complexity,
        progress: formData.progress,
      };

      if (formData.owner?.trim()) taskData.owner = formData.owner.trim();
      if (formData.start_date) taskData.start_date = formData.start_date;
      if (formData.finish_date) taskData.finish_date = formData.finish_date;
      if (formData.notes?.trim()) taskData.notes = formData.notes.trim();

      await createTask(projectId, taskData);
      
      // Reset form
      setFormData({
        description: '',
        parent_id: parentId,
        owner: '',
        start_date: '',
        finish_date: '',
        complexity: 3,
        progress: 0,
        notes: ''
      });

      onTaskCreated?.();
    } catch (err) {
      // Error is handled by the context
    }
  };

  const handleCancel = () => {
    clearError();
    setFormData({
      description: '',
      parent_id: parentId,
      owner: '',
      start_date: '',
      finish_date: '',
      complexity: 3,
      progress: 0,
      notes: ''
    });
    onCancel?.();
  };

  const formStyle = isInline ? {
    padding: '12px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
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
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="Enter task description"
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
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, complexity: parseInt(e.target.value) })}
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
            onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
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
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, finish_date: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          maxLength={1000}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            resize: 'vertical'
          }}
          placeholder="Optional notes"
        />
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
        justifyContent: 'flex-end'
      }}>
        {onCancel && (
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
        )}
        <button
          type="submit"
          disabled={isLoading || !formData.description.trim()}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: isLoading || !formData.description.trim() ? '#9ca3af' : '#3b82f6',
            color: 'white',
            fontSize: '14px',
            cursor: isLoading || !formData.description.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskCreator;