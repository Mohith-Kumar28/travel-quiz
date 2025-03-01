import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ClueCard } from "./ClueCard";
import { AnswerOptions } from "./AnswerOptions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRandomDestination, getRandomOptions } from "@/lib/data";
import { GameProps, Destination } from "@/types";
import { useWebSocket } from "@/lib/WebSocketContext";

export function GameBoard({ username }: GameProps) {
  const [currentDestination, setCurrentDestination] = useState<Destination | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentClue, setCurrentClue] = useState(0);
  const { updateScore } = useWebSocket();

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

  return (
    <Card className="overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDestination.alias + currentClue}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="p-6 space-y-6"
        >
          {/* Clue Section */}
          <div className="space-y-4">
            <ClueCard
              clue={currentDestination.clues[currentClue]}
              isRevealed={true}
            />

            {!isAnswered && currentClue < currentDestination.clues.length - 1 && (
              <div className="flex justify-center">
                <Button onClick={handleNextClue} variant="outline">
                  Next Clue ({currentClue + 1}/{currentDestination.clues.length})
                </Button>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <AnswerOptions
            options={options}
            correctAnswer={currentDestination.name}
            onAnswer={handleAnswer}
            disabled={isAnswered}
          />

          {/* Result Section */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="p-4 bg-muted">
                <div className="text-center space-y-2">
                  <p className="font-medium text-lg">
                    {currentDestination.name === options[0] ? (
                      <span className="text-green-500">🎉 Correct!</span>
                    ) : (
                      <span className="text-red-500">😢 Not quite...</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Fun fact: {currentDestination.funFacts[0]}
                  </p>
                </div>
              </Card>

              <div className="flex justify-center gap-4">
                <Button onClick={handleNextQuestion} size="lg">
                  Next Question
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
} 