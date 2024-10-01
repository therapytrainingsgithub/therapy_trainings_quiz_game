// File: /pages/api/check-savegame.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { name } = await request.json(); // Get the player name from the request body

    // Check if a save game exists for the given user
    const { data: existingSession, error } = await supabase
      .from('Sessions')
      .select('round')
      .eq('name', name)
      .maybeSingle();

    if (error) {
      console.error('Error checking session:', error);
      return NextResponse.json({ error: 'Error checking session' }, { status: 500 });
    }

    if (existingSession) {
      // If a save game exists, return the round number
      return NextResponse.json({ exists: true, round: existingSession.round }, { status: 200 });
    } else {
      // If no save game is found
      return NextResponse.json({ exists: false }, { status: 200 });
    }
  } catch (error) {
    console.error('Unexpected server error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
