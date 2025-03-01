"use client";

import { GameBoard } from "@/components/GameBoard";

export default function ChallengePage({
  params,
}: {
  params: { username: string };
}) {
  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-background to-muted">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            🎮 Challenge from {decodeURIComponent(params.username)}
          </h1>
          <p className="text-muted-foreground">
            Can you beat their score in The Globetrotter Challenge?
          </p>
        </div>
        
        <GameBoard challengerId={decodeURIComponent(params.username)} />
      </div>
    </main>
  );
} 