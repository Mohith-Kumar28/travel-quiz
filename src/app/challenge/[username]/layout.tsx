import { Metadata, ResolvingMetadata } from 'next';

type LayoutProps = {
  params: { username: string };
  children: React.ReactNode;
}

type MetadataProps = {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
  { params }: MetadataProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return {
    title: `Challenge from ${params.username} - The Globetrotter Challenge`,
    description: `Can you beat ${params.username}'s score in The Globetrotter Challenge? Test your knowledge of world destinations!`,
  };
}

export default function ChallengeLayout({ children }: LayoutProps) {
  return children;
} 