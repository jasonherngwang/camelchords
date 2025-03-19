import * as React from 'react';
import { SongEditor } from './song-editor';

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: songId } = await params;
  return (
    <React.Suspense>
      <SongEditor songId={songId} />
    </React.Suspense>
  );
}
