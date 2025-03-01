"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GameBoard } from "@/components/GameBoard";
import { WebSocketProvider, useWebSocket } from "@/lib/WebSocketContext";

function GameContent({ roomId }: { roomId: string }) {
  const { currentRoom } = useWebSocket();
  const router = useRouter();

  useEffect(() => {
    if (!currentRoom || !currentRoom.isGameStarted) {
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

export default function GamePage({
  params,
}: {
  params: { roomId: string };
}) {
  return (
    <WebSocketProvider>
      <GameContent roomId={params.roomId} />
    </WebSocketProvider>
  );
} 