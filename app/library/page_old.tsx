import { redirect } from 'next/navigation';
import { getUser, getSongs } from '@/lib/db/queries';
import { parseSongContent } from '@/lib/utils';

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const songs = await getSongs();
  const parsedSong = parseSongContent(songs[0].content || '');
  return (
    <div className="whitespace-pre-wrap">
      {parsedSong.map((line, lineIndex) => (
        <div key={lineIndex} className="flex flex-col">
          {/* Render chords first */}
          <div className="flex">
            {line.map((block, blockIndex) => {
              if (block.type === 'chord') {
                // Calculate the width based on the corresponding lyric
                const lyric = line.find(
                  (b, i) => i > blockIndex && b.type === 'lyric'
                );
                const width = lyric
                  ? `${lyric.content.length * 0.5}rem`
                  : 'auto';
                return (
                  <span
                    key={blockIndex}
                    className="text-sm text-gray-500 font-mono"
                    style={{ width, minWidth: width }}
                  >
                    {block.content}
                  </span>
                );
              }
              return null;
            })}
          </div>
          {/* Then render lyrics */}
          <div className="flex">
            {line.map(
              (block, blockIndex) =>
                block.type === 'lyric' && (
                  <span key={blockIndex} className="text-base font-mono">
                    {block.content}
                  </span>
                )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
