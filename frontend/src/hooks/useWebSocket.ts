import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { OnlineUser, ConnectionStatus, WebSocketMessage } from '../types/collaboration';

interface UseWebSocketReturn {
  connectionStatus: string;
  onlineUsers: OnlineUser[];
  lastHeartbeat?: Date;
  connectionError?: string;
  latency?: number;
  sendMessage: (message: Partial<WebSocketMessage>) => void;
  reconnect: () => void;
}

export const useWebSocket = (projectId: string): UseWebSocketReturn => {
  const { token, user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date>();
  const [connectionError, setConnectionError] = useState<string>();
  const [latency, setLatency] = useState<number>();
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const pingTimeRef = useRef<number>(0);

  const connect = useCallback(() => {
    if (!token || !projectId || !user) return;

    try {
      setConnectionStatus('connecting');
      setConnectionError(undefined);

      const wsUrl = `ws://localhost:8000/ws/${projectId}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        setConnectionError(undefined);
        
        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            pingTimeRef.current = Date.now();
            ws.send(JSON.stringify({
              type: 'heartbeat',
              project_id: projectId,
              user_id: user.email,
              user_name: user.email,
              user_email: user.email,
              timestamp: new Date().toISOString()
            }));
          }
        }, 30000); // 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connection.established':
              // Handle initial project users list
              if (message.data?.project_users) {
                const users = message.data.project_users.map((user: any) => ({
                  id: user.email,
                  name: user.name,
                  email: user.email,
                  joinedAt: new Date(user.connected_at),
                  isEditing: false
                }));
                setOnlineUsers(users);
              }
              break;
              
            case 'heartbeat':
              const pingTime = Date.now() - pingTimeRef.current;
              setLatency(pingTime);
              setLastHeartbeat(new Date());
              break;
              
            case 'user_joined':
              setOnlineUsers(prev => {
                const exists = prev.find(u => u.email === message.user_email);
                if (!exists) {
                  return [...prev, {
                    id: message.user_id,
                    name: message.user_name,
                    email: message.user_email,
                    joinedAt: new Date(message.timestamp),
                    isEditing: false
                  }];
                }
                return prev;
              });
              break;
              
            case 'user_left':
              setOnlineUsers(prev => prev.filter(u => u.email !== message.user_email));
              break;
              
            case 'editing_start':
              setOnlineUsers(prev => prev.map(u => 
                u.email === message.user_email 
                  ? { ...u, isEditing: true, editingTask: message.data?.task_id }
                  : u
              ));
              break;
              
            case 'editing_end':
              setOnlineUsers(prev => prev.map(u => 
                u.email === message.user_email 
                  ? { ...u, isEditing: false, editingTask: undefined }
                  : u
              ));
              break;
              
            default:
              console.log('Received WebSocket message:', message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setConnectionStatus('disconnected');
        
        // Clear intervals
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        
        // Reconnect after delay
        if (!event.wasClean) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setConnectionError('Connection failed');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus('error');
      setConnectionError('Failed to establish connection');
    }
  }, [token, projectId, user]);

  const sendMessage = useCallback((message: Partial<WebSocketMessage>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && user) {
      const fullMessage: WebSocketMessage = {
        type: message.type || 'heartbeat',
        project_id: projectId,
        user_id: user.email,
        user_name: user.email,
        user_email: user.email,
        timestamp: new Date().toISOString(),
        ...message
      };
      
      wsRef.current.send(JSON.stringify(fullMessage));
    }
  }, [projectId, user]);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect]);

  // Connect when hook mounts or dependencies change
  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    connectionStatus,
    onlineUsers,
    lastHeartbeat,
    connectionError,
    latency,
    sendMessage,
    reconnect
  };
};