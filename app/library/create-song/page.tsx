"use client";

import { useState, useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createSong, updateSong, deleteSong } from "@/app/library/actions";
import { ActionState } from "@/lib/auth/middleware";
import { Textarea } from "@/components/ui/textarea";
import { Song } from "@/lib/db/schema";
import { queryAiForSong } from "@/app/library/actions";

export default function CreateSongPage({
  mode = "create",
  song,
}: {
  mode?: "create" | "update";
  song?: Song;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "create" ? createSong : updateSong,
    { name: song?.name || "", content: song?.content || "", error: "" }
  );
  const [songPrompt, setSongPrompt] = useState("");
  const [generationPending, setGenerationPending] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const generateSong = async () => {
    setGenerationPending(true);
    const prompt =
      mode === "create"
        ? `Generate a new children's song with a unique musical structure. Consider using different:
          - Time signatures (3/4, 4/4, 6/8, etc.)
          - Song forms (verse-chorus, AABA, call-and-response, etc.)
          - Rhythmic patterns (syncopation, waltz, march, etc.)
          - Chord progressions (beyond just I-IV-V)
          - Melodic ranges and intervals
          Be creative and avoid common patterns.
          Do not write any annotations in the result. Only return chords and lyrics. ${songPrompt}`
        : `Update my existing song according to these instruction: ${songPrompt}. Here is the existing song: ${
            contentRef.current?.value ?? song?.content
          }`;
    const generated = await queryAiForSong(prompt);
    if (generated && nameRef.current && contentRef.current) {
      nameRef.current.value = generated.data.songName;
      contentRef.current.value = generated.data.songContent;
    }
    setGenerationPending(false);
  };

  const disableButton = Boolean(pending || generationPending);

  return (
    <form action={formAction}>
      <div className="grid gap-6">
        {mode === "update" && song?.id && (
          <input type="hidden" name="id" value={song.id} />
        )}
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={state.name}
            required
            minLength={1}
            placeholder="Enter the song name."
            className="text-text"
            ref={nameRef}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            name="content"
            defaultValue={state.content}
            required
            minLength={1}
            placeholder="Enter chords and lyrics in ChordPro format."
            className="min-h-80 text-text"
            ref={contentRef}
          />
          {state?.error && (
            <div className="text-red-500 text-sm">{state.error}</div>
          )}
        </div>
        <div className="flex gap-x-2 justify-start">
          <Button
            type="submit"
            disabled={disableButton}
            className="cursor-pointer"
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Loading...
              </>
            ) : mode === "create" ? (
              "Create song"
            ) : (
              "Update song"
            )}
          </Button>
          {mode === "update" && song && (
            <Button
              type="button"
              onClick={() => deleteSong(song.id)}
              disabled={disableButton}
              className="cursor-pointer"
              variant="destructive"
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : (
                "Delete song"
              )}
            </Button>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="song-prompt">Content</Label>
          <Textarea
            id="song-prompt"
            name="song-prompt"
            value={songPrompt}
            onChange={(e) => setSongPrompt(e.target.value)}
            minLength={1}
            className="min-h-24 text-text"
          />
        </div>
        <div className="flex gap-x-2 justify-start">
          <Button
            type="button"
            onClick={generateSong}
            disabled={disableButton}
            className="cursor-pointer"
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Loading...
              </>
            ) : mode === "create" ? (
              "Generate song"
            ) : (
              "Transform song"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
