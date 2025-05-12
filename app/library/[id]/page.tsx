import * as React from 'react';
import { SongViewer } from './song-viewer';

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: songId } = await params;
  return (
    <React.Suspense>
      <SongViewer songId={songId} />
    </React.Suspense>
  );
}
