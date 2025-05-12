"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { validatedActionWithUser } from "@/lib/auth/middleware";
import { getUser } from "@/lib/db/queries";
import { NewSong, songs, type Song } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { GoogleGenAI, Type } from "@google/genai";

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

const generatedSongSchema = z.object({
  songName: z.string(),
  songContent: z.string(),
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const queryAiForSong = async (prompt: string) => {
  const user = await getUser();
  if (!user) {
    throw new Error("User is not authenticated");
  }

  if (!prompt) {
    throw new Error("Prompt is required.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            songName: {
              type: Type.STRING,
              description: "Name of the song",
              nullable: false,
            },
            songContent: {
              type: Type.STRING,
              description:
                "Chords and lyrics of the song, in basic ChordPro format. Every line must start with a chord. Use newlines to separarate. Example: [Am]Mary had [C]a little lamb",
              nullable: false,
            },
          },
          required: ["songName", "songContent"],
        },
      },
    });
    const songJson = JSON.parse(
      response?.candidates?.[0]?.content?.parts?.[0]?.text || ""
    );
    const song = generatedSongSchema.safeParse(songJson);
    if (!song.success) {
      throw new Error(song.error.errors[0].message);
    }
    return song;
  } catch (error) {
    console.error("Error querying Gemini:", error);
  }
};
