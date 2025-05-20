"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Song } from "@/lib/db/schema";
import { ActionState } from "@/lib/auth/middleware";
import { deleteSong } from "@/lib/actions/library";

interface SongEditorProps {
  mode: "create" | "update";
  state: ActionState;
  formAction: (payload: FormData) => void;
  pending: boolean;
  song?: Song;
}

export interface SongEditorRef {
  nameRef: React.RefObject<HTMLInputElement | null>;
  contentRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const SongEditor = React.forwardRef<SongEditorRef, SongEditorProps>(
  ({ mode, state, formAction, pending, song }, ref) => {
    const nameRef = React.useRef<HTMLInputElement>(null);
    const contentRef = React.useRef<HTMLTextAreaElement>(null);

    React.useImperativeHandle(ref, () => ({
      nameRef,
      contentRef,
    }));

    React.useEffect(() => {
      if (nameRef.current) nameRef.current.value = state.name || "";
      if (contentRef.current) contentRef.current.value = state.content || "";
    }, [state.name, state.content]);

    return (
      <form action={formAction}>
        <div className="grid gap-6">
          {mode === "update" && song?.id && (
            <input type="hidden" name="id" value={song.id} />
          )}
          <div className="grid gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              ref={nameRef}
              id="name"
              name="name"
              type="text"
              defaultValue={state.name}
              required
              minLength={1}
              placeholder="Enter the song name."
              className="text-text"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="content">Content</Label>
            <Textarea
              ref={contentRef}
              id="content"
              name="content"
              defaultValue={state.content}
              required
              minLength={1}
              placeholder="Enter chords and lyrics in ChordPro format."
              className="min-h-80 text-text"
            />
            {state?.error && (
              <div className="text-red-500 text-sm">{state.error}</div>
            )}
          </div>
          <div className="flex gap-x-2 justify-start">
            <Button type="submit" disabled={pending} className="cursor-pointer">
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
                onClick={async () => {
                  if (
                    window.confirm("Are you sure you want to delete this song?")
                  ) {
                    const result = await deleteSong(song.id);
                    if (result?.error) {
                      console.error("Delete failed:", result.error);
                    }
                  }
                }}
                disabled={pending}
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
        </div>
      </form>
    );
  }
);

SongEditor.displayName = "SongEditor";
