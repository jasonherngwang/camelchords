export interface ContentBlock {
  type: "chord" | "lyric" | "annotation";
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
    if (
      (line.startsWith("[") &&
        line.endsWith("]") &&
        !line.slice(1, -1).includes("[")) ||
      (line.startsWith("(") &&
        line.endsWith(")") &&
        !line.slice(1, -1).includes("[")) ||
      (line.startsWith("{") &&
        line.endsWith("}") &&
        !line.slice(1, -1).includes("{"))
    ) {
      return [
        {
          type: "annotation" as const,
          content: line.slice(1, -1), // Remove brackets/braces
        },
      ];
    }

    const parts = line.split(/(\[[^\]]+\])/g).map((x) => x.trim());
    return parts
      .map((part) => {
        if (part.startsWith("[") && part.endsWith("]")) {
          return {
            type: "chord" as const,
            content: part.slice(1, -1), // Remove brackets
          };
        }
        return {
          type: "lyric" as const,
          content: part,
        };
      })
      .filter((part) => !!part.content);
  });
}
