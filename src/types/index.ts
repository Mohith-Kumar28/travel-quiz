export interface Destination {
  alias: string;
  name: string;
  clues: string[];
  funFacts: string[];
}

export interface GameState {
  currentScore: number;
  totalPlayed: number;
  username?: string;
}

export interface GameProps {
  username?: string;
  challengerId?: string;
}

export interface ClueCardProps {
  clue: string;
  isRevealed: boolean;
}

export interface AnswerOptionsProps {
  options: string[];
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  disabled: boolean;
}

export interface ScoreDisplayProps {
  score: number;
  total: number;
  username?: string;
} 