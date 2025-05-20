"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createSong, updateSong } from "@/lib/actions/library";
import { ActionState } from "@/lib/auth/middleware";
import { Textarea } from "@/components/ui/textarea";
import { Song } from "@/lib/db/schema";
import { queryAiForSong } from "@/lib/actions/library";
import { toast } from "sonner";
import { SongEditor } from "@/components/library/song-editor";

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
  const [ukuTabsUrl, setUkuTabsUrl] = useState("");
  const [scrapingPending, setScrapingPending] = useState(false);

  const editorRef = useRef<{
    nameRef: React.RefObject<HTMLInputElement>;
    contentRef: React.RefObject<HTMLTextAreaElement>;
  }>(null);

  const generateSong = async () => {
    setGenerationPending(true);
    const contentInput = editorRef.current?.contentRef.current;

    if (!contentInput) {
      toast.error("No content provided");
      setGenerationPending(false);
      return;
    }

    const songFormatPrompt = `
Annotations enclosed in parentheses, on their own line.
Chords enclosed in square brackets. Lyrics as text.
Chords and lyrics can alternate on the same line, with the chord immediately before the location it should be played.
Only return annotations, chords, and lyrics. Do not return any other responses or text.

Example:
(Verse 1)
[C]Twinkle twinkle [F]little star
[Em7]How I wonder [D]where you are
    `;

    try {
      let detailedPrompt;
      if (mode === "create") {
        detailedPrompt = `Generate a new children's song based on the following theme: "${songPrompt}".
It must be formatted in Simplified ChordPro. Guidelines for Simplified ChordPro format:
${songFormatPrompt}`;
      } else {
        detailedPrompt = `Update the following existing song:
\`\`\`
${contentInput.value}
\`\`\`

Use the following instructions for the update: "${songPrompt}".
It must be formatted in Simplified ChordPro. Guidelines for Simplified ChordPro format:
${songFormatPrompt}`;
      }

      const result = await queryAiForSong(detailedPrompt);

      if (result?.error) {
        toast.error(result.error);
      } else if (result.songContent) {
        contentInput.value = result.songContent;
        toast.success("Song generated!");
      } else {
        toast.error("Failed to generate song.");
      }
    } catch (error) {
      toast.error("An error occurred during generation.");
    } finally {
      setGenerationPending(false);
    }
  };

  const scrapeAndLoadSong = async () => {
    if (!ukuTabsUrl) return;
    setScrapingPending(true);
    const contentInput = editorRef.current?.contentRef.current;

    if (!contentInput) {
      toast.error("Editor reference not available.");
      setScrapingPending(false);
      return;
    }

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: ukuTabsUrl }),
      });
      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errorBody = await response.json();
          errorMsg = errorBody.error || errorMsg;
        } catch (e) {
          // Ignore if response body is not JSON or empty
        }
        console.error(`Scraping failed: ${response.status} ${errorMsg}`);
      } else {
        const scrapedContent = await response.text();
        contentInput.value = scrapedContent;
        toast.success("Imported from UkuTabs!");
      }
    } catch (error) {
      console.error("Error calling scrape API:", error);
    } finally {
      setScrapingPending(false);
    }
  };

  const disableInteraction = Boolean(
    pending || generationPending || scrapingPending
  );

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  return (
    <div className="grid gap-6">
      <SongEditor
        ref={editorRef}
        mode={mode}
        state={state}
        formAction={formAction}
        pending={pending}
        song={song}
      />

      <div className="grid gap-3 border-t pt-6">
        <Label htmlFor="song-prompt">{`${
          mode === "create" ? "Generate New" : "Transform Existing"
        } Song`}</Label>
        <Textarea
          id="song-prompt"
          name="song-prompt"
          value={songPrompt}
          onChange={(e) => setSongPrompt(e.target.value)}
          minLength={1}
          placeholder={
            mode === "create"
              ? "Describe the song you want to generate..."
              : "Describe the changes you want..."
          }
          className="min-h-24 text-text"
          disabled={disableInteraction}
        />
        <div className="flex gap-x-2 justify-start">
          <Button
            type="button"
            onClick={generateSong}
            disabled={disableInteraction || !songPrompt}
            className="cursor-pointer"
          >
            {generationPending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Generating...
              </>
            ) : mode === "create" ? (
              "Generate song"
            ) : (
              "Transform song"
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 border-t pt-6">
        <Label htmlFor="ukutabs-url">Import from UkuTabs</Label>
        <div className="flex gap-x-2">
          <Input
            id="ukutabs-url"
            name="ukutabs-url"
            type="url"
            placeholder="https://ukutabs.com/..."
            value={ukuTabsUrl}
            onChange={(e) => setUkuTabsUrl(e.target.value)}
            className="text-text"
            disabled={disableInteraction}
          />
        </div>
        <div className="flex gap-x-2 justify-start">
          <Button
            type="button"
            onClick={scrapeAndLoadSong}
            disabled={disableInteraction || !ukuTabsUrl}
            className="cursor-pointer"
          >
            {scrapingPending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Importing...
              </>
            ) : (
              "Import"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
