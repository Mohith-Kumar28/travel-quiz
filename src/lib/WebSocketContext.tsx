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
      console.log("Broadcasting message:", type, payload);
      broadcastChannelRef.current.postMessage({ type, payload });
    } else {
      console.error("Broadcast channel not initialized");
    }
  }, []);

  // Listen for updates from other tabs
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      
      console.log("Received message:", type, payload);
      
      switch (type) {
        case 'REQUEST_STATE':
          // Send current state to other tabs
          console.log("Sending current state to other tabs");
          broadcastUpdate('SYNC_ROOMS', Array.from(rooms.entries()));
          break;
        
        case 'SYNC_ROOMS':
          // Update local rooms state
          console.log("Syncing rooms from other tab");
          rooms = new Map(payload);
          // Update current room if we're in one
          if (currentRoom) {
            const updatedRoom = rooms.get(currentRoom.id);
            if (updatedRoom) {
              console.log("Updating current room from sync:", updatedRoom);
              // Update state immediately without transition
              setCurrentRoom(updatedRoom);
              setPlayers(updatedRoom.players);
            }
          }
          break;
        
        case 'ROOM_UPDATE':
          const updatedRoom = payload;
          console.log("Room update received:", updatedRoom);
          rooms.set(updatedRoom.id, updatedRoom);
          if (currentRoom?.id === updatedRoom.id) {
            console.log("Updating current room:", updatedRoom);
            // Update state immediately without transition
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
    if (!currentRoom) {
      console.error("Cannot update score: No current room");
      return;
    }

    console.log("WebSocketContext: Updating score for", username, "to", score, "/", total);
    console.log("Current room players:", currentRoom.players);

    // Update score immediately without debouncing
    const updatedPlayers = currentRoom.players.map(p => {
      if (p.username === username) {
        console.log("Found player to update:", p.username);
        return { ...p, score, total };
      }
      return p;
    });

    console.log("Updated players:", updatedPlayers);

    const updatedRoom = {
      ...currentRoom,
      players: updatedPlayers
    };

    // Update the rooms map first
    rooms.set(currentRoom.id, updatedRoom);

    // Update local state immediately without transition
    setCurrentRoom(updatedRoom);
    setPlayers(updatedPlayers);

    // Broadcast to other tabs immediately
    broadcastUpdate('ROOM_UPDATE', updatedRoom);
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