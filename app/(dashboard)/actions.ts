'use server';

import { deleteSessionById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteSession(id: number) {
  await deleteSessionById(id);
  revalidatePath('/');
}

