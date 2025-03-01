import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ClueCard } from "./ClueCard";
import { AnswerOptions } from "./AnswerOptions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRandomDestination, getRandomOptions } from "@/lib/data";
import { GameProps, Destination } from "@/types";
import { useWebSocket } from "@/lib/WebSocketContext";

const QUESTION_TIME_LIMIT = 30; // 30 seconds per question
const MATCH_TIME_LIMIT = 300; // 5 minutes per match
const TOTAL_QUESTIONS = 10; // 10 questions per match

export function GameBoard({ username }: GameProps) {
  console.log("GameBoard rendered with username:", username);

  const [currentDestination, setCurrentDestination] = useState<Destination | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentClue, setCurrentClue] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [matchTimeLeft, setMatchTimeLeft] = useState(MATCH_TIME_LIMIT);
  const [isGameOver, setIsGameOver] = useState(false);
  const { updateScore, currentRoom } = useWebSocket();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const loadNewDestination = useCallback(() => {
    console.log("Loading new destination");
    try {
      const destination = getRandomDestination();
      console.log("New destination loaded:", destination.name);
      setCurrentDestination(destination);
      
      const newOptions = getRandomOptions(destination.name);
      console.log("Options generated:", newOptions);
      setOptions(newOptions);
      
      setIsAnswered(false);
      setCurrentClue(0);
      setTimeLeft(QUESTION_TIME_LIMIT);
      setSelectedAnswer(null);
    } catch (error) {
      console.error("Error loading new destination:", error);
    }
  }, []);

  // Question timer effect
  useEffect(() => {
    if (isAnswered || isGameOver || !currentDestination) return;

    console.log("Starting question timer with", QUESTION_TIME_LIMIT, "seconds");
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          console.log("Question time ended, marking as answered");
          clearInterval(timer);
          setIsAnswered(true);
          setTotalPlayed((prev) => prev + 1);
          
          // Update score when time runs out
          if (username) {
            console.log("Time's up, updating score for", username);
            updateScore(username, score, totalPlayed + 1);
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      console.log("Clearing question timer");
      clearInterval(timer);
    };
  }, [isAnswered, currentDestination, isGameOver, username, score, totalPlayed, updateScore]);

  // Match timer effect
  useEffect(() => {
    if (isGameOver) return; // Don't start timer if game is already over
    
    console.log("Starting match timer with", MATCH_TIME_LIMIT, "seconds");
    const timer = setInterval(() => {
      setMatchTimeLeft((prev) => {
        if (prev <= 1) {
          console.log("Match time ended, setting game over");
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      console.log("Clearing match timer");
      clearInterval(timer);
    };
  }, [isGameOver]); // Only re-run if isGameOver changes

  useEffect(() => {
    loadNewDestination();
  }, [loadNewDestination]);

  // Check if game should end
  useEffect(() => {
    if (totalPlayed >= TOTAL_QUESTIONS) {
      setIsGameOver(true);
    }
  }, [totalPlayed]);

  const handleAnswer = (answer: string) => {
    console.log("handleAnswer called with:", answer);
    console.log("Current state:", {
      username,
      isAnswered,
      currentDestination: currentDestination?.name,
      options
    });

    if (!username || isAnswered) {
      console.log("Answer rejected:", {
        reason: !username ? "no username" : "already answered",
        username,
        isAnswered
      });
      return;
    }

    console.log("Processing answer:", {
      selected: answer,
      correct: currentDestination?.name,
      isCorrect: answer === currentDestination?.name
    });
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    const newTotalPlayed = totalPlayed + 1;
    setTotalPlayed(newTotalPlayed);

    let newScore = score;
    if (answer === currentDestination?.name) {
      console.log("Correct answer! Updating score");
      newScore = score + 1;
      setScore(newScore);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      console.log("Incorrect answer");
    }

    // Update score immediately and ensure it's broadcasted
    console.log("Broadcasting score update:", {
      username,
      newScore,
      newTotalPlayed
    });
    updateScore(username, newScore, newTotalPlayed);
  };

  const handleNextClue = () => {
    if (currentDestination && currentClue < currentDestination.clues.length - 1) {
      setCurrentClue((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    console.log("Next question requested, total played:", totalPlayed, "of", TOTAL_QUESTIONS);
    if (totalPlayed >= TOTAL_QUESTIONS) {
      console.log("All questions completed, setting game over");
      setIsGameOver(true);
    } else {
      console.log("Loading next question");
      loadNewDestination();
    }
  };

  // Move username check to the render section
  if (!username) {
    console.log("GameBoard: No username provided");
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Waiting for username...</p>
      </Card>
    );
  }

  if (isGameOver) {
    // Sort players by score percentage
    const sortedPlayers = [...(currentRoom?.players || [])].sort((a, b) => {
      const scoreA = (a.score / (a.total || 1)) * 100;
      const scoreB = (b.score / (b.total || 1)) * 100;
      return scoreB - scoreA || b.score - a.score; // If percentages are equal, compare absolute scores
    });

    const currentPlayer = sortedPlayers.find(p => p.username === username);
    const winner = sortedPlayers[0];
    const playerRank = sortedPlayers.findIndex(p => p.username === username) + 1;

    return (
      <Card className="overflow-hidden">
        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">🏁 Game Over!</h2>
            <p className="text-muted-foreground">
              {winner.username === username ? 
                "Congratulations! You won! 🎉" : 
                `Game won by ${winner.username}! 🏆`}
            </p>
          </div>

          {/* Final Standings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Final Standings:</h3>
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.username}
                  className={`p-4 rounded-lg ${
                    player.username === username
                      ? "bg-primary/10 border border-primary"
                      : index === 0
                      ? "bg-yellow-500/10 border border-yellow-500"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold">#{index + 1}</span>
                      <span className="font-medium">
                        {player.username}
                        {player.username === username && " (You)"}
                        {index === 0 && " 👑"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {((player.score / (player.total || 1)) * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {player.score}/{player.total} correct
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player Stats */}
          {currentPlayer && (
            <div className={`p-6 rounded-lg text-center space-y-2 ${
              playerRank === 1 ? "bg-yellow-500/10" : "bg-muted"
            }`}>
              <p className="text-lg">
                {playerRank === 1 ? (
                  <span>🏆 You Won! 🎉</span>
                ) : (
                  <span>You finished #{playerRank}</span>
                )}
              </p>
              <p className="text-muted-foreground">
                With {currentPlayer.score} correct answers out of {currentPlayer.total} questions
                ({((currentPlayer.score / (currentPlayer.total || 1)) * 100).toFixed(0)}%)
              </p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (!currentDestination) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Loading destination...</p>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          {/* Match Timer */}
          <div className="text-center font-mono font-bold text-muted-foreground mb-2">
            Match Time: {formatTime(matchTimeLeft)} | Question {totalPlayed + 1}/{TOTAL_QUESTIONS}
          </div>

          {/* Question Timer */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full transition-colors ${
                timeLeft > 10 ? "bg-primary" : "bg-red-500"
              }`}
              initial={{ width: "100%" }}
              animate={{ width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 font-mono font-bold">
              {timeLeft}s
            </div>
          </div>

          {/* Clue Section */}
          <div className="space-y-4 mt-8">
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
                    {timeLeft === 0 ? (
                      <span className="text-red-500">⏰ Time&apos;s up!</span>
                    ) : selectedAnswer === currentDestination.name ? (
                      <span className="text-green-500">🎉 Correct!</span>
                    ) : (
                      <span className="text-red-500">😢 Not quite... The correct answer was {currentDestination.name}</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Fun fact: {currentDestination.funFacts[0]}
                  </p>
                </div>
              </Card>

              <div className="flex justify-center gap-4">
                <Button onClick={handleNextQuestion} size="lg">
                  {totalPlayed >= TOTAL_QUESTIONS - 1 ? "See Results" : "Next Question"}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
} 