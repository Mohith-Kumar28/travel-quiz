import React, { createContext, useContext, useEffect, useState } from 'react';

interface Player {
  username: string;
  score: number;
  total: number;
}

interface WebSocketContextType {
  players: Player[];
  updateScore: (username: string, score: number, total: number) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // In a real implementation, this would be your WebSocket server URL
    const ws = new WebSocket('wss://your-websocket-server.com');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'players_update') {
        setPlayers(data.players);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(socket);

    return () => {
      ws.close();
    };
  }, []);

  const updateScore = (username: string, score: number, total: number) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'score_update',
        data: { username, score, total }
      }));
    }
  };

  return (
    <WebSocketContext.Provider value={{ players, updateScore }}>
      {children}
    </WebSocketContext.Provider>
  );
} 