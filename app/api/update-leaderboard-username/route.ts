import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, oldUsername, newUsername } = body;

    // Update the profile's username
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ username: newUsername })
      .eq('id', userId);

    if (profileUpdateError) {
      return NextResponse.json({ error: 'Error updating profile username.' }, { status: 500 });
    }

    // Update the username in the Leaderboard table
    const { data: updatedLeaderboard, error: leaderboardUpdateError } = await supabase
      .from('Leaderboard')
      .update({ name: newUsername })
      .eq('name', oldUsername);  // Find entries with the old username

    if (leaderboardUpdateError) {
      return NextResponse.json({ error: 'Error updating Leaderboard username.' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Username updated successfully in both profiles and leaderboard.',
      updatedLeaderboard,
    });
  } catch (error) {
    console.error('Error updating username:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
