"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameBoard } from "@/components/GameBoard";
import { generateGuestName } from "@/lib/utils";
import { WebSocketProvider } from "@/lib/WebSocketContext";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setUsername(generateGuestName());
  }, []);

  if (isPlaying) {
    return (
      <WebSocketProvider>
        <GameBoard username={username} />
      </WebSocketProvider>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[90vw] max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              🌍 The Globetrotter Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Test your knowledge of world destinations! Guess famous places from cryptic clues and learn fascinating facts along the way.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Your Explorer Name
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  We've generated a random explorer name for you. Feel free to change it!
                </p>
              </div>
              
              <Button 
                className="w-full"
                onClick={() => setIsPlaying(true)}
                disabled={!username.trim()}
              >
                Start Playing
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
