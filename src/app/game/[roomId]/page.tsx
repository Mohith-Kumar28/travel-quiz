"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { GameBoard } from "@/components/GameBoard";
import { useWebSocket } from "@/lib/WebSocketContext";
import { generateGuestName } from "@/lib/utils";

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
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center mb-4">
          Room: {roomId}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentRoom.players.map(player => (
            <div 
              key={player.username}
              className="p-4 rounded-lg bg-muted text-center"
            >
              <div className="font-medium">{player.username}</div>
              <div className="text-sm text-muted-foreground">
                Score: {player.score}/{player.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      <GameBoard username={currentRoom.players[0].username} />
    </div>
  );
}

export default function GamePage() {
  return <GameContent />;
} 