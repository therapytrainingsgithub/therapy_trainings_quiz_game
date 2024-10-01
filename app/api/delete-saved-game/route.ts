import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function DELETE(request: Request) {
  try {
    const { name } = await request.json(); // Expecting 'name' in the request body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid data: name is required' }, { status: 400 });
    }

    const { data: existingSession, error: sessionError } = await supabase
      .from('Sessions')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json({ error: 'Error fetching session' }, { status: 500 });
    }

    if (!existingSession) {
      return NextResponse.json({ error: 'No saved game found for this user' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('Sessions')
      .delete()
      .eq('id', existingSession.id);

    if (deleteError) {
      console.error('Error deleting saved game:', deleteError);
      return NextResponse.json({ error: 'Error deleting saved game' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Saved game deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected server error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}