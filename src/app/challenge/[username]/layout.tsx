import { Metadata } from 'next';

type Props = {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  return {
    title: `Challenge from ${params.username} - The Globetrotter Challenge`,
    description: `Can you beat ${params.username}'s score in The Globetrotter Challenge? Test your knowledge of world destinations!`,
  };
}

export default function ChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 