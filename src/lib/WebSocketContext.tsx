"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

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

type MessagePayload = Room | [string, Room][];

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

// Simulated room storage (in a real app, this would be on the server)
let rooms = new Map<string, Room>();

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
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Initialize broadcast channel
  useEffect(() => {
    broadcastChannelRef.current = new BroadcastChannel('game_updates');
    // Request current state when joining
    broadcastChannelRef.current.postMessage({ type: 'REQUEST_STATE' });
    return () => {
      broadcastChannelRef.current?.close();
    };
  }, []);

  // Function to broadcast updates to all tabs
  const broadcastUpdate = useCallback((type: string, payload: MessagePayload) => {
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type, payload });
    }
  }, []);

  // Listen for updates from other tabs
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      
      switch (type) {
        case 'REQUEST_STATE':
          // Send current state to other tabs
          broadcastUpdate('SYNC_ROOMS', Array.from(rooms.entries()));
          break;
        
        case 'SYNC_ROOMS':
          // Update local rooms state
          rooms = new Map(payload);
          // Update current room if we're in one
          if (currentRoom) {
            const updatedRoom = rooms.get(currentRoom.id);
            if (updatedRoom) {
              setCurrentRoom(updatedRoom);
              setPlayers(updatedRoom.players);
            }
          }
          break;
        
        case 'ROOM_UPDATE':
          const updatedRoom = payload;
          rooms.set(updatedRoom.id, updatedRoom);
          if (currentRoom?.id === updatedRoom.id) {
            setCurrentRoom(updatedRoom);
            setPlayers(updatedRoom.players);
          }
          break;
      }
    };

    broadcastChannelRef.current?.addEventListener('message', handleMessage);
    return () => {
      broadcastChannelRef.current?.removeEventListener('message', handleMessage);
    };
  }, [currentRoom, broadcastUpdate]);

  const createRoom = useCallback((username: string) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom: Room = {
      id: roomId,
      host: username,
      players: [{ username, score: 0, total: 0, isReady: false }],
      isGameStarted: false
    };
    rooms.set(roomId, newRoom);
    setCurrentRoom(newRoom);
    setPlayers(newRoom.players);
    broadcastUpdate('ROOM_UPDATE', newRoom);
    return roomId;
  }, [broadcastUpdate]);

  const joinRoom = useCallback((roomId: string, username: string) => {
    const existingRoom = rooms.get(roomId);
    
    if (!existingRoom) {
      // If room doesn't exist, create it
      const newRoom: Room = {
        id: roomId,
        host: username,
        players: [{ username, score: 0, total: 0, isReady: false }],
        isGameStarted: false
      };
      rooms.set(roomId, newRoom);
      setCurrentRoom(newRoom);
      setPlayers(newRoom.players);
      broadcastUpdate('ROOM_UPDATE', newRoom);
      return;
    }

    // Check if player already exists
    const playerExists = existingRoom.players.some(p => p.username === username);
    
    if (!playerExists) {
      // Create a new array with the new player
      const updatedPlayers = [
        ...existingRoom.players,
        { username, score: 0, total: 0, isReady: false }
      ];
      
      const updatedRoom = {
        ...existingRoom,
        players: updatedPlayers
      };
      
      rooms.set(roomId, updatedRoom);
      setCurrentRoom(updatedRoom);
      setPlayers(updatedPlayers);
      broadcastUpdate('ROOM_UPDATE', updatedRoom);
    } else {
      // If player exists, just update the current state
      setCurrentRoom(existingRoom);
      setPlayers(existingRoom.players);
    }
  }, [broadcastUpdate]);

  const setPlayerReady = useCallback((username: string) => {
    if (!currentRoom) return;

    const updatedPlayers = currentRoom.players.map(p =>
      p.username === username ? { ...p, isReady: true } : p
    );

    const updatedRoom = {
      ...currentRoom,
      players: updatedPlayers
    };

    rooms.set(currentRoom.id, updatedRoom);
    setCurrentRoom(updatedRoom);
    setPlayers(updatedPlayers);
    broadcastUpdate('ROOM_UPDATE', updatedRoom);
  }, [currentRoom, broadcastUpdate]);

  const startGame = useCallback(() => {
    if (!currentRoom) return;

    const updatedRoom = {
      ...currentRoom,
      isGameStarted: true
    };
    rooms.set(currentRoom.id, updatedRoom);
    setCurrentRoom(updatedRoom);
    broadcastUpdate('ROOM_UPDATE', updatedRoom);
  }, [currentRoom, broadcastUpdate]);

  const updateScore = useCallback((username: string, score: number, total: number) => {
    if (!currentRoom) return;

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      const updatedPlayers = currentRoom.players.map(p =>
        p.username === username ? { ...p, score, total } : p
      );

      const updatedRoom = {
        ...currentRoom,
        players: updatedPlayers
      };

      rooms.set(currentRoom.id, updatedRoom);
      setCurrentRoom(updatedRoom);
      setPlayers(updatedPlayers);
      broadcastUpdate('ROOM_UPDATE', updatedRoom);
    }, 500);
  }, [currentRoom, broadcastUpdate]);

  useEffect(() => {
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