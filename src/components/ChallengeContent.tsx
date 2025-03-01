"use client";

import { GameBoard } from "./GameBoard";

interface ChallengeContentProps {
  username: string;
}

export function ChallengeContent({ username }: ChallengeContentProps) {
  const decodedUsername = decodeURIComponent(username);

  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-background to-muted">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            🎮 Challenge from {decodedUsername}
          </h1>
          <p className="text-muted-foreground">
            Can you beat their score in The Globetrotter Challenge?
          </p>
        </div>
        
        <GameBoard challengerId={decodedUsername} />
      </div>
    </main>
  );
} 