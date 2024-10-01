import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty');  // Fetch difficulty from query params

  console.log("Received difficulty:", difficulty); // Log difficulty value for debugging

  if (!difficulty) {
    return NextResponse.json({ error: 'Difficulty level is required' }, { status: 400 });
  }

  const { data: questions, error } = await supabase
    .from('Questionss')
    .select('*')
    .eq('difficulty', difficulty);  // Filter by difficulty level

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (questions.length === 0) {
    return NextResponse.json({ error: 'No questions found for the specified difficulty.' }, { status: 404 });
  }

  return NextResponse.json({ questions });
}
