import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ClueCardProps } from "@/types";

export function ClueCard({ clue }: ClueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="p-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-center font-medium"
          >
            {clue}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
} 