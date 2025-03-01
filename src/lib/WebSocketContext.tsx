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
const rooms = new Map<string, Room>();

// Create a single instance of BroadcastChannel for the app
const broadcastChannel = new BroadcastChannel('game_updates');

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

  // Function to broadcast room updates to all tabs
  const broadcastRoomUpdate = useCallback((room: Room) => {
    broadcastChannel.postMessage({ type: 'ROOM_UPDATE', room });
  }, []);

  // Function to request current room state
  const requestRoomState = useCallback((roomId: string) => {
    broadcastChannel.postMessage({ type: 'REQUEST_ROOM_STATE', roomId });
  }, []);

  // Listen for room updates from other tabs
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ROOM_UPDATE') {
        const updatedRoom = event.data.room;
        // Update local state and storage if it's our room
        if (currentRoom?.id === updatedRoom.id || !currentRoom) {
          rooms.set(updatedRoom.id, updatedRoom);
          setCurrentRoom(updatedRoom);
          setPlayers(updatedRoom.players);
        }
      } else if (event.data.type === 'REQUEST_ROOM_STATE') {
        // If we have the requested room, broadcast it
        const room = rooms.get(event.data.roomId);
        if (room) {
          broadcastRoomUpdate(room);
        }
      }
    };

    broadcastChannel.onmessage = handleMessage;

    return () => {
      broadcastChannel.onmessage = null;
    };
  }, [currentRoom, broadcastRoomUpdate]);

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
    broadcastRoomUpdate(newRoom);
    return roomId;
  }, [broadcastRoomUpdate]);

  const joinRoom = useCallback((roomId: string, username: string) => {
    // First, request current room state from other tabs
    requestRoomState(roomId);
    
    // Wait a bit for any responses, then proceed with join
    setTimeout(() => {
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
        broadcastRoomUpdate(newRoom);
        return;
      }

      // Don't add if player already exists
      if (!existingRoom.players.some(p => p.username === username)) {
        const updatedRoom = {
          ...existingRoom,
          players: [...existingRoom.players, { 
            username, 
            score: 0, 
            total: 0, 
            isReady: false 
          }]
        };
        rooms.set(roomId, updatedRoom);
        setCurrentRoom(updatedRoom);
        setPlayers(updatedRoom.players);
        broadcastRoomUpdate(updatedRoom);
      } else {
        setCurrentRoom(existingRoom);
        setPlayers(existingRoom.players);
      }
    }, 100); // Small delay to allow for room state responses
  }, [broadcastRoomUpdate, requestRoomState]);

  const setPlayerReady = useCallback((username: string) => {
    if (!currentRoom) return;

    const updatedRoom = {
      ...currentRoom,
      players: currentRoom.players.map(p =>
        p.username === username ? { ...p, isReady: true } : p
      )
    };
    rooms.set(currentRoom.id, updatedRoom);
    setCurrentRoom(updatedRoom);
    setPlayers(updatedRoom.players);
    broadcastRoomUpdate(updatedRoom);
  }, [currentRoom, broadcastRoomUpdate]);

  const startGame = useCallback(() => {
    if (!currentRoom) return;

    const updatedRoom = {
      ...currentRoom,
      isGameStarted: true
    };
    rooms.set(currentRoom.id, updatedRoom);
    setCurrentRoom(updatedRoom);
    broadcastRoomUpdate(updatedRoom);
  }, [currentRoom, broadcastRoomUpdate]);

  const updateScore = useCallback((username: string, score: number, total: number) => {
    if (!currentRoom) return;

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      const updatedRoom = {
        ...currentRoom,
        players: currentRoom.players.map(p =>
          p.username === username ? { ...p, score, total } : p
        )
      };
      rooms.set(currentRoom.id, updatedRoom);
      setCurrentRoom(updatedRoom);
      setPlayers(updatedRoom.players);
      broadcastRoomUpdate(updatedRoom);
    }, 500);
  }, [currentRoom, broadcastRoomUpdate]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      // Don't close the broadcast channel here as it's shared
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