import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ContentBlock {
  type: 'chord' | 'lyric';
  content: string;
}

export function parseSongContent(
  song?: string | null
): ContentBlock[][] | null {
  if (!song) return null;

  const lines = song
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean);

  return lines.map((line) => {
    const parts = line.split(/(\[[^\]]+\])/g).map((x) => x.trim());
    return parts
      .map((part) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          return {
            type: 'chord' as const,
            content: part.slice(1, -1), // Remove brackets
          };
        }
        return {
          type: 'lyric' as const,
          content: part,
        };
      })
      .filter((part) => !!part.content);
  });
}
