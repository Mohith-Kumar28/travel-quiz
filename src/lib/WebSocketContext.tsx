"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface Player {
  username: string;
  score: number;
  total: number;
  isReady: boolean;
}

interface Room {
  id: string;
  host: string;
  players: Player[];
  isGameStarted: boolean;
}

interface WebSocketContextType {
  players: Player[];
  currentRoom: Room | null;
  updateScore: (username: string, score: number, total: number) => void;
  createRoom: (username: string) => string;
  joinRoom: (roomId: string, username: string) => void;
  setPlayerReady: (username: string) => void;
  startGame: () => void;
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
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const createRoom = useCallback((username: string) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom: Room = {
      id: roomId,
      host: username,
      players: [{ username, score: 0, total: 0, isReady: false }],
      isGameStarted: false
    };
    setCurrentRoom(newRoom);
    setPlayers(newRoom.players);
    return roomId;
  }, []);

  const joinRoom = useCallback((roomId: string, username: string) => {
    setCurrentRoom(prev => {
      if (!prev || prev.id !== roomId) {
        const newRoom: Room = {
          id: roomId,
          host: username,
          players: [{ username, score: 0, total: 0, isReady: false }],
          isGameStarted: false
        };
        return newRoom;
      }
      
      if (prev.players.some(p => p.username === username)) {
        return prev;
      }

      const updatedRoom = {
        ...prev,
        players: [...prev.players, { username, score: 0, total: 0, isReady: false }]
      };
      setPlayers(updatedRoom.players);
      return updatedRoom;
    });
  }, []);

  const setPlayerReady = useCallback((username: string) => {
    setCurrentRoom(prev => {
      if (!prev) return null;
      const updatedPlayers = prev.players.map(p => 
        p.username === username ? { ...p, isReady: true } : p
      );
      return { ...prev, players: updatedPlayers };
    });
  }, []);

  const startGame = useCallback(() => {
    setCurrentRoom(prev => {
      if (!prev) return null;
      return { ...prev, isGameStarted: true };
    });
  }, []);

  const updateScore = useCallback((username: string, score: number, total: number) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      setPlayers(prevPlayers => {
        const existingPlayerIndex = prevPlayers.findIndex(p => p.username === username);
        
        if (existingPlayerIndex !== -1) {
          const existingPlayer = prevPlayers[existingPlayerIndex];
          if (existingPlayer.score === score && existingPlayer.total === total) {
            return prevPlayers;
          }
        }

        if (existingPlayerIndex !== -1) {
          const updatedPlayers = [...prevPlayers];
          updatedPlayers[existingPlayerIndex] = { 
            ...updatedPlayers[existingPlayerIndex],
            score, 
            total 
          };
          return updatedPlayers;
        } else {
          return [...prevPlayers, { username, score, total, isReady: false }];
        }
      });
    }, 500);
  }, []);

  React.useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const value = React.useMemo(() => ({
    players,
    currentRoom,
    updateScore,
    createRoom,
    joinRoom,
    setPlayerReady,
    startGame
  }), [players, currentRoom, updateScore, createRoom, joinRoom, setPlayerReady, startGame]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
} 