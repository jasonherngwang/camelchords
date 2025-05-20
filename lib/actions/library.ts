"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { validatedActionWithUser } from "@/lib/auth/middleware";
import { getUser } from "@/lib/db/queries";
import { NewSong, songs } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { GoogleGenAI, Type } from "@google/genai";
import { checkRateLimit } from "@/lib/rate-limiting/utils";

const createSongSchema = z.object({
  name: z.string(),
  content: z.string(),
});

export const createSong = validatedActionWithUser(
  createSongSchema,
  async (data, formData) => {
    const { name, content } = data;
    let createdSongId;

    try {
      const existingSong = await db
        .select()
        .from(songs)
        .where(eq(songs.name, name))
        .limit(1);

      if (existingSong.length > 0) {
        return {
          error: "Song name already exists. Please change it.",
          name,
          content,
        };
      }

      const user = await getUser();
      if (!user) {
        return {
          error: "User does not exist. Please log in.",
        };
      }

      const now = new Date();
      const newSong: NewSong = {
        name,
        content,
        createdAt: now,
        updatedAt: now,
        userId: user.id,
      };

      const [createdSong] = await db.insert(songs).values(newSong).returning();

      if (!createdSong) {
        return {
          error: "Failed to create song. Please try again.",
          name,
          content,
        };
      }
      createdSongId = createdSong.id;
    } catch (error) {
      console.error("Error creating song:", error);
      throw new Error("Failed to create song");
    } finally {
      if (createdSongId) {
        redirect(`/library/${createdSongId}`);
      }
    }
  }
);

const updateSongSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
});

export const updateSong = validatedActionWithUser(
  updateSongSchema,
  async (data, formData) => {
    const id = Number(data.id);
    const { name, content } = data;

    if (isNaN(id)) {
      return {
        error: "Invalid song ID",
        name,
        content,
      };
    }

    try {
      const existingSong = await db
        .select()
        .from(songs)
        .where(eq(songs.id, id))
        .limit(1);

      if (existingSong.length === 0) {
        return {
          error: "Song not found.",
          name,
          content,
        };
      }

      const user = await getUser();
      if (!user) {
        return {
          error: "User does not exist. Please log in.",
          name,
          content,
        };
      }

      const now = new Date();
      const [updatedSong] = await db
        .update(songs)
        .set({ name, content, updatedAt: now })
        .where(eq(songs.id, id))
        .returning();

      if (!updatedSong) {
        return {
          error: "Failed to update song. Please try again.",
          name,
          content,
        };
      }
    } catch (error) {
      console.error("Error updating song:", error);
      throw new Error("Failed to update song");
    } finally {
      redirect(`/library/${id}`);
    }
  }
);

export const deleteSong = async (songId: number) => {
  const user = await getUser();
  if (!user) {
    throw new Error("User is not authenticated");
  }

  if (isNaN(songId)) {
    return {
      error: "Invalid song ID",
    };
  }

  try {
    const existingSong = await db
      .select()
      .from(songs)
      .where(eq(songs.id, songId))
      .limit(1);

    if (existingSong[0]?.userId !== user.id) {
      return { error: "Not authorized to delete song" };
    }

    await db.delete(songs).where(eq(songs.id, songId)).returning();
  } catch (error) {
    console.error("Error updating song:", error);
    throw new Error("Failed to update song");
  } finally {
    redirect(`/library`);
  }
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const queryAiForSong = async (prompt: string) => {
  const rateLimitResult = await checkRateLimit("queryAiForSong");
  if (rateLimitResult.error) {
    return { error: rateLimitResult.error };
  }

  const user = await getUser();
  if (!user) {
    console.error("queryAiForSong: User is not authenticated");
    return { error: "User is not authenticated. Please log in." };
  }
  if (!prompt) {
    return { error: "Prompt is required." };
  }

  try {
    console.log(prompt);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return { songContent: response.text };
  } catch (error) {
    return { error: "Error querying AI for song." };
  }
};

export async function _formatSongContentInternal(
  rawContent: string
): Promise<{ data?: string; error?: string }> {
  if (typeof rawContent !== "string") {
    return { error: "Invalid song content format from AI." };
  }

  // Basic validation: ensure it looks somewhat like ChordPro
  // (e.g., contains brackets, doesn't have excessively long lines without chords)
  if (!rawContent.includes("[") || !rawContent.includes("]")) {
    return {
      error:
        "Generated content does not appear to be in ChordPro format (missing brackets).",
    };
  }

  const lines = rawContent.split("\n");
  const formattedLines = [];
  let parseError = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === "") {
      // Keep empty lines if they are intentional for spacing
      formattedLines.push("");
      continue;
    }

    // A very basic check: does the line start with something like [Chord]?
    // This is a simplified check and might need to be more robust.
    if (!trimmedLine.startsWith("[")) {
      // Attempt to prefix with a common chord if a line doesn't start with one,
      // or flag as an error. For now, let's be strict.
      // This indicates a potential formatting issue from the AI.
      console.warn(`Line does not start with a chord: "${trimmedLine}"`);
      // formattedLines.push(`[G] ${trimmedLine}`); // Example: default to [G]
      parseError = true; // Flag that there was a formatting issue.
      // continue; // Skip this line or try to fix it.
      // For now, let's pass it through but acknowledge the error.
      return {
        error: `Generated content has lines not starting with a chord: "${trimmedLine}"`,
      };
    }

    // Check for excessively long lines without any apparent chord changes
    // This is a heuristic. '100' is arbitrary.
    if (trimmedLine.length > 150 && trimmedLine.split("[").length < 2) {
      return {
        error: `Generated content contains an excessively long line without chord changes: "${trimmedLine.substring(
          0,
          50
        )}..."`,
      };
    }

    formattedLines.push(trimmedLine);
  }

  if (parseError) {
    // This specific error is now handled per line, but a general flag could be useful.
    // return { error: "Some lines in the generated content do not start with a chord." };
  }

  if (formattedLines.join("\n").length < 10) {
    // Arbitrary minimum length
    return {
      error: "Generated song content is too short or improperly formatted.",
    };
  }

  return { data: formattedLines.join("\n") };
}

// Function specifically for formatting existing text content into ChordPro using AI
export async function _formatChordProWithAI(
  rawContent: string
): Promise<{ data?: string; error?: string }> {
  if (!rawContent || typeof rawContent !== "string") {
    return { error: "Invalid raw content provided for formatting." };
  }

  // Rate limiting check
  const rateLimitResult = await checkRateLimit("formatChordProWithAI");
  if (rateLimitResult.error) {
    return { error: rateLimitResult.error };
  }
  // End Rate Limiting

  // Construct the prompt for the AI
  const prompt = `Please reformat the following raw song text into the ChordPro format. Ensure chords are enclosed in square brackets ([C]) directly before the syllable they apply to. Maintain the original lyrics and structure as much as possible. Only output the formatted ChordPro text, with no introductory phrases, explanations, or concluding remarks.\n\nRAW CONTENT:\n\`\`\`\n${rawContent}\n\`\`\`\n\nCHORDPRO FORMATTED OUTPUT:`;

  try {
    // Use the existing 'ai' instance
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "text/plain",
      },
    });

    // Extract the text response
    let formattedText: string | undefined;
    if (
      response?.candidates &&
      response.candidates.length > 0 &&
      response.candidates[0].content &&
      response.candidates[0].content.parts &&
      response.candidates[0].content.parts.length > 0 &&
      response.candidates[0].content.parts[0].text
    ) {
      formattedText = response.candidates[0].content.parts[0].text.trim();
    }

    if (!formattedText || formattedText.length < 10) {
      console.error(
        "AI formatting returned empty or very short content.",
        JSON.stringify(response, null, 2)
      );
      if (response?.promptFeedback?.blockReason) {
        return {
          error: `AI blocked the request due to: ${response.promptFeedback.blockReason}. The scraped content might be problematic.`,
        };
      }
      if (
        response?.candidates?.[0]?.finishReason &&
        response.candidates[0].finishReason !== "STOP"
      ) {
        return {
          error: `AI generation finished unexpectedly: ${response.candidates[0].finishReason}. Please try again.`,
        };
      }
      return { error: "AI failed to return valid formatted content." };
    }

    if (!formattedText.includes("[") || !formattedText.includes("]")) {
      console.warn(
        "AI output might not be valid ChordPro (missing brackets):",
        formattedText.substring(0, 100)
      );
      // Decide whether to return error or proceed
      // return { error: "AI output does not appear to be in ChordPro format." };
    }

    return { data: formattedText };
  } catch (error: any) {
    console.error("Error querying AI for ChordPro formatting:", error);
    if (error.message && error.message.includes("SAFETY")) {
      return {
        error:
          "The AI detected a safety concern with the scraped content or its response. Formatting failed.",
      };
    }
    return {
      error: "Failed to format content using AI. Please try again later.",
    };
  }
}

// Renaming the old function
export async function _validateAndCleanSongContentInternal(
  rawContent: string
): Promise<{ data?: string; error?: string }> {
  if (typeof rawContent !== "string") {
    return { error: "Invalid song content format from AI." };
  }

  // Basic validation: ensure it looks somewhat like ChordPro
  // (e.g., contains brackets, doesn't have excessively long lines without chords)
  if (!rawContent.includes("[") || !rawContent.includes("]")) {
    return {
      error:
        "Generated content does not appear to be in ChordPro format (missing brackets).",
    };
  }

  const lines = rawContent.split("\n");
  const formattedLines = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === "") {
      // Keep empty lines if they are intentional for spacing
      formattedLines.push("");
      continue;
    }

    if (!trimmedLine.startsWith("[")) {
      console.warn(`Line does not start with a chord: "${trimmedLine}"`);
      return {
        error: `Generated content has lines not starting with a chord: "${trimmedLine}"`,
      };
    }

    if (trimmedLine.length > 150 && trimmedLine.split("[").length < 2) {
      return {
        error: `Generated content contains an excessively long line without chord changes: "${trimmedLine.substring(
          0,
          50
        )}..."`,
      };
    }

    formattedLines.push(trimmedLine);
  }

  if (formattedLines.join("\n").length < 10) {
    // Arbitrary minimum length
    return {
      error: "Generated song content is too short or improperly formatted.",
    };
  }

  return { data: formattedLines.join("\n") };
}
