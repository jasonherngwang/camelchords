'use server';

import { updateSong as dbUpdateSong } from '@/lib/db/queries';
import { Song } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';

export async function updateSong(updatedSong: Song) {
  try {
    await dbUpdateSong(updatedSong);
    revalidatePath(`/library/${updatedSong.id}`);
  } catch (error) {
    console.error('Error updating song:', error);
    throw new Error('Failed to update song');
  }
}
