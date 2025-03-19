'use client';

import * as React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { useParams } from 'next/navigation';
import { LibraryContext } from '@/app/library/context';

export const LibraryHeader = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const songsContext = React.useContext(LibraryContext);
  const { id: songId } = React.use(params);
  const selectedSong = songsContext.songs?.find(
    (song) => song.id?.toString() === songId
  );

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {selectedSong?.name || 'No song selected'}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
