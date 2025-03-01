import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnswerOptionsProps } from "@/types";

export function AnswerOptions({ options, correctAnswer, onAnswer, disabled }: AnswerOptionsProps) {
  const handleClick = (option: string) => {
    console.log("Option clicked:", option, "Correct answer:", correctAnswer, "Disabled:", disabled);
    if (!disabled) {
      onAnswer(option);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-lg mx-auto">
      {options.map((option, index) => (
        <motion.div
          key={option}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            variant="outline"
            className="w-full h-16 text-lg"
            onClick={() => handleClick(option)}
            disabled={disabled}
          >
            {option}
          </Button>
        </motion.div>
      ))}
    </div>
  );
} 