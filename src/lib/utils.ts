import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const adjectives = [
  "Wandering", "Curious", "Adventurous", "Jolly", "Mysterious",
  "Cheerful", "Daring", "Energetic", "Friendly", "Graceful",
  "Happy", "Intrepid", "Joyful", "Kind", "Lucky"
];

const travelers = [
  "Explorer", "Voyager", "Wanderer", "Nomad", "Adventurer",
  "Globetrotter", "Traveler", "Backpacker", "Pioneer", "Discoverer",
  "Pathfinder", "Wayfarer", "Journeyer", "Rover", "Trekker"
];

export function generateGuestName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const traveler = travelers[Math.floor(Math.random() * travelers.length)];
  return `${adjective}${traveler}${Math.floor(Math.random() * 1000)}`;
}
