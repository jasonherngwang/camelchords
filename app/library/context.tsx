'use client';

import { createContext, ReactNode } from 'react';

import { Song } from '@/lib/db/schema';

type LibraryContextType = {
  songs: Song[];
};

export const LibraryContext = createContext<LibraryContextType>({
  songs: [],
});

interface LibraryProviderProps {
  children: ReactNode;
  songs: Song[];
}

export function LibraryProvider({ children, songs }: LibraryProviderProps) {
  return (
    <LibraryContext.Provider value={{ songs }}>
      {children}
    </LibraryContext.Provider>
  );
}
