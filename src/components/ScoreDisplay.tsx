import { Progress } from "@/components/ui/progress";
import { ScoreDisplayProps } from "@/types";

export function ScoreDisplay({ score, total, username }: ScoreDisplayProps) {
  const percentage = (score / Math.max(total, 1)) * 100;

  return (
    <div className="w-full max-w-lg mx-auto space-y-2">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">
            {username ? `${username}'s Score` : 'Your Score'}
          </p>
          <p className="text-sm text-muted-foreground">
            {score} correct out of {total} questions
          </p>
        </div>
        <div className="text-2xl font-bold">
          {percentage.toFixed(0)}%
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
} 