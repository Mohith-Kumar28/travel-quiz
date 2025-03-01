import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ShareDialogProps {
  username: string;
  score: number;
  total: number;
}

export function ShareDialog({ username, score, total }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/challenge/${encodeURIComponent(username)}`;
  const shareText = `🌍 I scored ${score}/${total} in The Globetrotter Challenge! Can you beat my score? Play here:`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The Globetrotter Challenge',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share className="h-4 w-4" />
          Challenge a Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your score</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            Challenge your friends to beat your score in The Globetrotter Challenge!
          </p>
          <div className="flex items-center space-x-2">
            <input
              className="flex-1 p-2 text-sm border rounded-md bg-muted"
              value={shareUrl}
              readOnly
            />
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="flex justify-between gap-2">
            <Button onClick={handleShare} className="gap-2 flex-1">
              <Share className="h-4 w-4" />
              Share Challenge
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 