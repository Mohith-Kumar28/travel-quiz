import { Metadata } from 'next';

type Props = {
  params: Promise<{ username: string }>;
}

type LayoutProps = {
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username  = (await params).username;
  return {
    title: `Challenge from ${username} - The Globetrotter Challenge`,
    description: `Can you beat ${username}'s score in The Globetrotter Challenge? Test your knowledge of world destinations!`,
  };
}

export default async function ChallengeLayout({ children }: LayoutProps) {
  return children;
} 