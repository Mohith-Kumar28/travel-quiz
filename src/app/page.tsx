"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateGuestName } from "@/lib/utils";
import { WebSocketProvider, useWebSocket } from "@/lib/WebSocketContext";
import { useRouter } from "next/navigation";

function WaitingRoom({ roomId, username }: { roomId: string; username: string }) {
  const { currentRoom, setPlayerReady, startGame } = useWebSocket();
  const router = useRouter();

  useEffect(() => {
    if (currentRoom?.isGameStarted) {
      router.push(`/game/${roomId}`);
    }
  }, [currentRoom?.isGameStarted, roomId, router]);

  const allPlayersReady = currentRoom?.players.every(p => p.isReady);
  const isHost = currentRoom?.host === username;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-center">Waiting Room</h2>
        <p className="text-sm text-muted-foreground text-center">
          Share this code with your friends: <span className="font-mono font-bold">{roomId}</span>
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Players:</h3>
        <div className="space-y-1">
          {currentRoom?.players.map(player => (
            <div key={player.username} className="flex items-center justify-between">
              <span>{player.username}</span>
              <span className={player.isReady ? "text-green-500" : "text-yellow-500"}>
                {player.isReady ? "Ready" : "Waiting"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={() => setPlayerReady(username)}>
          I&apos;m Ready
        </Button>
        {isHost && allPlayersReady && (
          <Button onClick={startGame}>
            Start Game
          </Button>
        )}
      </div>
    </div>
  );
}

function HomeContent() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const { createRoom, joinRoom } = useWebSocket();

  useEffect(() => {
    setUsername(generateGuestName());
  }, []);

  const handleCreateRoom = () => {
    const newRoomId = createRoom(username);
    setRoomId(newRoomId);
  };

  const handleJoinRoom = () => {
    if (joinRoomId) {
      joinRoom(joinRoomId.toUpperCase(), username);
      setRoomId(joinRoomId.toUpperCase());
    }
  };

  if (roomId) {
    return <WaitingRoom roomId={roomId} username={username} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Your Explorer Name
        </label>
        <input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 rounded-md border bg-background"
        />
        <p className="text-xs text-muted-foreground">
          We&apos;ve generated a random explorer name for you. Feel free to change it!
        </p>
      </div>

      <div className="space-y-4">
        {showJoinInput ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter Room Code"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className="w-full p-2 rounded-md border bg-background uppercase"
              maxLength={6}
            />
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={handleJoinRoom}
                disabled={!joinRoomId || !username.trim()}
              >
                Join Room
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowJoinInput(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleCreateRoom}
              disabled={!username.trim()}
            >
              Create Room
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowJoinInput(true)}
            >
              Join Existing Room
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[90vw] max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              🌍 The Globetrotter Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WebSocketProvider>
              <HomeContent />
            </WebSocketProvider>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
