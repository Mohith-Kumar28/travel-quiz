// "use client";

import { Metadata } from 'next';
import { ChallengeContent } from '@/components/ChallengeContent';

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  return {
    title: `Challenge from ${params.username} - The Globetrotter Challenge`,
    description: `Can you beat ${params.username}'s score in The Globetrotter Challenge? Test your knowledge of world destinations!`,
  };
}

export default function ChallengePage({ params }: PageProps) {
  return <ChallengeContent username={params.username} />;
} 