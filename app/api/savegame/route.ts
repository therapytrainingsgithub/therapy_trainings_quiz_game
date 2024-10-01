// File: /api/savegame/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { score, streak, round, name,mode, overwrite } = await request.json();

    // Ensure data is valid
    if (!name || typeof name !== 'string' || typeof score !== 'number' || typeof streak !== 'number' || typeof round !== 'number' || typeof overwrite !== 'boolean') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Check if a session already exists for this user
    const { data: existingSession, error: sessionError } = await supabase
      .from('Sessions')
      .select('id, round')
      .eq('name', name)
      .maybeSingle();

    if (sessionError) {
      console.error('Session fetch error:', sessionError);
      return NextResponse.json({ error: 'Error fetching session' }, { status: 500 });
    }

    if (existingSession && !overwrite) {
      // Return conflict status if a session exists and overwrite is false
      return NextResponse.json({ error: 'Save game already exists', existingRound: existingSession.round }, { status: 409 });
    }

    if (existingSession && overwrite) {
      // Overwrite the existing session
      const { error: updateError } = await supabase
        .from('Sessions')
        .update({ score, streak, round,mode })
        .eq('id', existingSession.id);

      if (updateError) {
        console.error('Error overwriting save game:', updateError);
        return NextResponse.json({ error: 'Error overwriting game' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Game overwritten successfully' }, { status: 200 });
    }

    // Insert a new session
    const { data: newSession, error: saveError } = await supabase
      .from('Sessions')
      .insert([{ name, score, streak, round,mode }]);

    if (saveError) {
      console.error('Error saving game:', saveError);
      return NextResponse.json({ error: 'Error saving game' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Game saved successfully', newSession }, { status: 201 });
  } catch (error) {
    console.error('Unexpected server error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
