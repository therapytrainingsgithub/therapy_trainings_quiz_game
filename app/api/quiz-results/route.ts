import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);



export async function PATCH(request: Request) {
  try {
    const bodyText = await request.text();
    const { userId, newUsername } = JSON.parse(bodyText);

    // Update the Leaderboard entry based on the userId
    const { data: leaderboardEntry, error: updateError } = await supabase
      .from('Leaderboard')
      .update({ name: newUsername })
      .eq('id', userId);  // Assuming id in Leaderboard matches userId in profiles

    if (updateError) {
      console.error('Error updating leaderboard entry:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Leaderboard username updated successfully', leaderboard: leaderboardEntry }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: leaderboard, error: fetchError } = await supabase
      .from('Leaderboard')
      .select()
      .order('score', { ascending: false });

    if (fetchError) {
      console.error('Error fetching leaderboard:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ leaderboard }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error || 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const { name, score, streak, round } = JSON.parse(bodyText);

    // Validate the received data
    if (!name || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const nameString = name;  // Store the name directly as a string

    // Insert a new score entry for the user, regardless of previous scores
    const { data: newLeaderboardData, error: insertError } = await supabase
      .from('Leaderboard')
      .insert([{ name: nameString, score, streak, round }])  // Insert new entry with name as string
      .select();

    if (insertError) {
      console.error('Error inserting into Leaderboard:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log(`New entry created for user: ${nameString}`);
    return NextResponse.json({ message: `New entry created for user: ${nameString}`, leaderboard: newLeaderboardData }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error || 'An unexpected error occurred' }, { status: 500 });
  }
}