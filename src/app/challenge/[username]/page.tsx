


import { ChallengeContent } from '@/components/ChallengeContent';

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// export async function generateMetadata(
//   { params }: PageProps
// ): Promise<Metadata> {
//   const username  = (await params).username;
//   return {
//     title: `Challenge from ${username} - The Globetrotter Challenge`,
//     description: `Can you beat ${username}'s score in The Globetrotter Challenge? Test your knowledge of world destinations!`,
//   };
// }

export default async function ChallengePage({ params }: PageProps) {
  const username  = (await params).username;
  return <ChallengeContent username={username} />;
} 