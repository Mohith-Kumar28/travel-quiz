"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    // If there's no current room or we're in a different room,
    // join the room with a generated username
    if (!currentRoom || currentRoom.id !== roomId) {
      const username = generateGuestName();
      joinRoom(roomId, username);
    }
  }, [currentRoom, roomId, joinRoom]);

  useEffect(() => {
    if (currentRoom && !currentRoom.isGameStarted) {
      router.push("/");
    }
  }, [currentRoom, router]);

  if (!currentRoom) return null;

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
            className="p-4 bg-card text-card-foreground"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">
                  {player.username}
                  {player.username === currentRoom.players[0].username && " (You)"}
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
        <GameBoard username={currentRoom.players[0].username} />
      </div>
    </div>
  );
}

export default function GamePage() {
  return <GameContent />;
} 