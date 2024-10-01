import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  // Fetch the saved session from the database, including the mode
  const { data: session, error } = await supabase
    .from('Sessions')
    .select('*')
    .eq('name', name)
    .single();

  // Handle the case where no session is found
  if (error || !session) {
    return NextResponse.json({ error: 'No saved game found for this user.' }, { status: 404 });
  }

  // Return the session data if found
  return NextResponse.json({
    session: {
      score: session.score,
      streak: session.streak,
      round: session.round,
      questionIndex: session.questionIndex,
      difficulty: session.difficulty,
      mode: session.mode, // Ensure mode is returned
    }
  });
}
