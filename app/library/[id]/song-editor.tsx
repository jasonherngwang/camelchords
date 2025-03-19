'use client';

import * as React from 'react';
import { LibraryContext } from '@/app/library/context';
import { parseSongContent } from '@/lib/utils';
import { updateSong } from '@/app/actions';
import { ContentBlock } from '@/lib/utils';
import { Song } from '@/lib/db/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SongEditorProps {
  songId: string;
}

export const SongEditor = ({ songId }: SongEditorProps) => {
  const songsContext = React.useContext(LibraryContext);
  const selectedSong = songsContext.songs?.find(
    (song) => song.id?.toString() === songId
  );
  const parsedSong = parseSongContent(selectedSong?.content);
  console.log(parsedSong);

  const [isEditing, setIsEditing] = React.useState(false);
  const [currentSong, setCurrentSong] = React.useState<Song | null>(null);
  React.useEffect(() => {
    if (selectedSong) {
      setCurrentSong(selectedSong);
    }
  }, [selectedSong]);

  const handleSave = async () => {
    try {
      if (currentSong) {
        await updateSong(currentSong);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update song:', error);
    }
  };

  if (!selectedSong || !currentSong || !parsedSong) {
    return null;
  }

  return (
    <div>
      <div className="text-3xl">
        {isEditing ? (
          <Input
            type="text"
            value={currentSong.name}
            onChange={(e) => {
              setCurrentSong({ ...currentSong, name: e.target.value });
            }}
          />
        ) : (
          <div>{selectedSong.name}</div>
        )}
      </div>
      <div className="mt-8">
        {isEditing ? (
          <div className="font-mono">
            <Textarea
              value={currentSong.content || ''}
              onChange={(e) => {
                setCurrentSong({ ...currentSong, content: e.target.value });
              }}
            />
            <Button onClick={handleSave} className="mt-8 cursor-pointer">
              Save
            </Button>
          </div>
        ) : (
          <div>
            <SongDisplay parsedSong={parsedSong} />
            <Button
              onClick={() => setIsEditing(true)}
              className="mt-8 cursor-pointer"
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface SongDisplayProps {
  parsedSong: ContentBlock[][];
}

const SongDisplay = ({ parsedSong }: SongDisplayProps) => {
  return (
    <div className="font-mono space-y-2">
      {parsedSong.map((line, lineIndex) => (
        <div key={lineIndex} className="flex whitespace-nowrap overflow-x-auto">
          {line.map((block, blockIndex) => {
            if (block.type === 'lyric' && blockIndex === 0) {
              return (
                <div
                  key={blockIndex}
                  className="flex flex-col items-start mr-4"
                >
                  <span className="text-muted-foreground whitespace-nowrap">
                    &nbsp;
                  </span>
                  <span className="whitespace-nowrap">{block.content}</span>
                </div>
              );
            }
            if (block.type === 'chord') {
              // Find the next lyric block to pair with this chord
              const nextBlock = line[blockIndex + 1];
              const lyric =
                nextBlock?.type === 'lyric' ? nextBlock.content : ' ';

              return (
                <div
                  key={blockIndex}
                  className="flex flex-col items-start mr-4"
                >
                  <span className="text-muted-foreground whitespace-nowrap">
                    {block.content}
                  </span>
                  <span className="whitespace-nowrap">{lyric}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};
