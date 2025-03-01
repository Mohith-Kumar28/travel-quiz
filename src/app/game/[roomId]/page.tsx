"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { GameBoard } from "@/components/GameBoard";
import { useWebSocket } from "@/lib/WebSocketContext";
import { generateGuestName } from "@/lib/utils";
import { Card } from "@/components/ui/card";

function GameContent() {
  const { currentRoom, joinRoom } = useWebSocket();
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Room effect triggered:", { currentRoom, roomId });
    
    if (!currentRoom || currentRoom.id !== roomId) {
      // If no room or different room, join with new username
      const generatedUsername = generateGuestName();
      console.log("Generating new username:", generatedUsername);
      setUsername(generatedUsername);
      joinRoom(roomId, generatedUsername);
    } else {
      // If we're in the correct room, find our username from the players list
      const player = currentRoom.players.find(p => p.username === username);
      if (!player) {
        // If we can't find our current username in the room, generate a new one
        const generatedUsername = generateGuestName();
        console.log("Generating new username for existing room:", generatedUsername);
        setUsername(generatedUsername);
        joinRoom(roomId, generatedUsername);
      }
    }
    setIsLoading(false);
  }, [currentRoom, roomId, joinRoom, username]);

  useEffect(() => {
    if (currentRoom && !currentRoom.isGameStarted) {
      router.push("/");
    }
  }, [currentRoom, router]);

  if (!currentRoom || isLoading || !username) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-muted-foreground">Loading game... {!currentRoom ? "Connecting..." : !username ? "Setting up player..." : "Preparing game..."}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Room Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Room: {roomId}
        </h1>
        <p className="text-muted-foreground">
          Game in progress - Good luck everyone!
        </p>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentRoom.players.map(player => (
          <Card 
            key={player.username}
            className={`p-4 ${
              player.username === username
                ? "bg-primary/10 border border-primary"
                : "bg-card"
            } text-card-foreground`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">
                  {player.username}
                  {player.username === username && " (You)"}
                </h3>
                <span className={
                  player.score === 0 
                    ? "text-muted-foreground" 
                    : "text-green-500 font-medium"
                }>
                  {((player.score / (player.total || 1)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ 
                    width: `${(player.score / (player.total || 1)) * 100}%` 
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-right">
                Score: {player.score}/{player.total}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Game Board */}
      <div className="max-w-3xl mx-auto">
        <GameBoard username={username} />
      </div>
    </div>
  );
}

export default function GamePage() {
  return <GameContent />;
} 