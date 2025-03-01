import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ClueCard } from "./ClueCard";
import { AnswerOptions } from "./AnswerOptions";
import { ScoreDisplay } from "./ScoreDisplay";
import { ShareDialog } from "./ShareDialog";
import { Button } from "@/components/ui/button";
import { getRandomDestination, getRandomOptions } from "@/lib/data";
import { GameProps, Destination } from "@/types";
import { useWebSocket } from "@/lib/WebSocketContext";

export function GameBoard({ username, challengerId }: GameProps) {
  const [currentDestination, setCurrentDestination] = useState<Destination | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentClue, setCurrentClue] = useState(0);
  const { players, updateScore } = useWebSocket();

  const loadNewDestination = () => {
    const destination = getRandomDestination();
    setCurrentDestination(destination);
    setOptions(getRandomOptions(destination.name));
    setIsAnswered(false);
    setCurrentClue(0);
  };

  useEffect(() => {
    loadNewDestination();
  }, []);

  useEffect(() => {
    if (username) {
      updateScore(username, score, totalPlayed);
    }
  }, [score, totalPlayed, username, updateScore]);

  const handleAnswer = (answer: string) => {
    setIsAnswered(true);
    setTotalPlayed((prev) => prev + 1);

    if (answer === currentDestination?.name) {
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNextClue = () => {
    if (currentDestination && currentClue < currentDestination.clues.length - 1) {
      setCurrentClue((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    loadNewDestination();
  };

  if (!currentDestination) return null;

  const otherPlayers = players.filter(p => p.username !== username && p.username !== challengerId);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <ScoreDisplay
          score={score}
          total={totalPlayed}
          username={challengerId || username}
        />
        
        {otherPlayers.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Other Players</h3>
            <div className="space-y-1">
              {otherPlayers.map((player) => (
                <div key={player.username} className="text-sm flex justify-between items-center">
                  <span>{player.username}</span>
                  <span className="text-muted-foreground">
                    {player.score}/{player.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentDestination.alias + currentClue}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-8"
        >
          <ClueCard
            clue={currentDestination.clues[currentClue]}
            isRevealed={true}
          />

          {!isAnswered && currentClue < currentDestination.clues.length - 1 && (
            <div className="flex justify-center">
              <Button onClick={handleNextClue} variant="outline">
                Next Clue
              </Button>
            </div>
          )}

          <AnswerOptions
            options={options}
            correctAnswer={currentDestination.name}
            onAnswer={handleAnswer}
            disabled={isAnswered}
          />

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="font-medium mb-2">
                  {currentDestination.name === options[0] ? "🎉 Correct!" : "😢 Not quite..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Fun fact: {currentDestination.funFacts[0]}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={handleNextQuestion}>Next Question</Button>
                {username && <ShareDialog username={username} score={score} total={totalPlayed} />}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 