export interface OnlineUser {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  isEditing: boolean;
  editingTask?: string;
}

export interface ConnectionStatus {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  latency?: number;
  lastHeartbeat?: Date;
  error?: string;
}

export interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  lastSynced?: Date;
  pendingChanges: number;
  error?: string;
}

export interface WebSocketMessage {
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'user_joined' | 'user_left' | 'editing_start' | 'editing_end' | 'heartbeat' | 'connection.established';
  project_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  timestamp: string;
  data?: any;
}

export interface EditingLock {
  task_id: string;
  user_id: string;
  user_name: string;
  locked_at: string;
}