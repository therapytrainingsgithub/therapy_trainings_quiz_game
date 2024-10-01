
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL is not defined');
}
export const supabase = createClient(supabaseUrl, supabaseKey);

export type Session = {
  start_time: string;
  end_time: string;
  transcript: any;
  objections: number;
  user_id: number;
};

export async function getSessions(
  search: string,
  offset: number,
  user_id: string
): Promise<{
  sessions: Session[];
  newOffset: number | null;
  totalSessions: number;
}> {
  if (search) {
    const { data: sessions, error } = await supabase
      .from('Sessions')
      .select('*')
      .ilike('name', `%${search}%`)
      .limit(1000);

    if (error) throw new Error(error.message);

    return {
      sessions: sessions || [],
      newOffset: null,
      totalSessions: sessions ? sessions.length : 0
    };
  }
  if (user_id) {
    const { data: sessions, error } = await supabase
      .from('Sessions')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw new Error(error.message);

    return {
      sessions: sessions || [],
      newOffset: null,
      totalSessions: sessions ? sessions.length : 0
    };
  }

  if (offset === null) {
    return { sessions: [], newOffset: null, totalSessions: 0 };
  }

  const { data: totalSessinosData, error: totalSessionsError } = await supabase
    .from('Sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user_id);

  if (totalSessionsError) throw new Error(totalSessionsError.message);

  const totalSessions = totalSessinosData?.length || 0;

  const { data: moreSessions, error: moreSessionsError } = await supabase
    .from('Sessions')
    .select('*')
    .range(offset, offset + 4);

  if (moreSessionsError) throw new Error(moreSessionsError.message);

  const newOffset = moreSessions.length >= 5 ? offset + 5 : null;

  return {
    sessions: moreSessions,
    newOffset,
    totalSessions
  };
}

export async function deleteSessionById(id: number) {
  const { error } = await supabase.from('Sessions').delete().eq('id', id);

  if (error) throw new Error(error.message);
}

export async function createSession(session: Session) {
  const { data, error } = await supabase.from('Sessions').insert([session]);

  if (error) throw new Error(error.message);

  return data;
}


