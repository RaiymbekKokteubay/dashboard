import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
const table = process.env.SUPABASE_TABLE || 'llm_interactions';

// Server-side client
export const supabase = createClient(url, key, { db: { schema: 'public' } });

export async function listInteractions({ limit = 200, hours = 24, user_id, model }: { limit?: number, hours?: number, user_id?: string, model?: string }) {
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  let q = supabase.from(table).select('id,user_id,model,messages,message_count,total_duration_ms,created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(limit);
  if (user_id) q = q.eq('user_id', user_id);
  if (model) q = q.eq('model', model);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getInteraction(id: string) {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
  if (error) return null;
  return data as any;
}

export function flattenMessages(row: any) {
  let messages: any[] = row.messages || [];
  if (typeof messages === 'string') {
    try { messages = JSON.parse(messages); } catch { messages = []; }
  }
  const created_at = new Date(row.created_at || Date.now());
  return messages.map((m: any, i: number) => ({
    interaction_id: row.id,
    user_id: row.user_id,
    model: row.model,
    role: m.role,
    content: m.content,
    msg_index: i,
    created_at: new Date(created_at.getTime() + i * 10).toISOString(),
  }));
}

export function detectDuplicatePrompts(messages: any[], windowMinutes = 5) {
  const userMsgs = messages.filter(m => m.role === 'user');
  const byUser: Record<string, any[]> = {};
  for (const m of userMsgs) {
    byUser[m.user_id] ||= [];
    byUser[m.user_id].push(m);
  }
  const out: any[] = [];
  for (const uid of Object.keys(byUser)) {
    const arr = byUser[uid].sort((a,b) => +new Date(a.created_at) - +new Date(b.created_at));
    for (let i=1;i<arr.length;i++) {
      const a = arr[i-1], b = arr[i];
      const dt = (+new Date(b.created_at) - +new Date(a.created_at))/1000;
      if ((a.content||'') === (b.content||'') && dt <= windowMinutes*60) out.push(b);
    }
  }
  return out;
}
