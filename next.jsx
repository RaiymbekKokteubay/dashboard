# File: package.json
{
  "name": "llm-dashboard",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.4",
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "20.11.30",
    "@types/react": "18.2.66",
    "@types/react-dom": "18.2.22",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.5",
    "typescript": "5.4.5"
  }
}

# File: .env.local.example
SUPABASE_URL=https://YOURPROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY   # server-only, do NOT commit
SUPABASE_TABLE=llm_interactions                   # change if needed
TZ=America/New_York

# File: next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: '4mb' } }
};
module.exports = nextConfig;

# File: app/layout.tsx
export const metadata = { title: 'LLM Dashboard', description: 'Supabase → Next.js' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <a href="/" style={{ fontWeight: 700, fontSize: 20 }}>LLM Dashboard</a>
            <nav style={{ display: 'flex', gap: 12 }}>
              <a href="/" style={{ opacity: 0.8 }}>Home</a>
              <a href="/metrics" style={{ opacity: 0.8 }}>Metrics</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

# File: app/page.tsx
import { listInteractions } from "@/lib/supabase";
import { toLocal } from "@/lib/format";

export default async function Home() {
  const rows = await listInteractions({ limit: 200, hours: 24 });
  return (
    <main>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Recent Interactions</h1>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map((r:any) => (
          <a key={r.id} href={`/i/${r.id}`} style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, color: '#666' }}>{r.model} • {toLocal(r.created_at)}</div>
            <div style={{ fontSize: 14 }}>user: {r.user_id} • msgs: {r.message_count} • {Math.round(r.total_duration_ms || 0)} ms</div>
          </a>
        ))}
      </div>
    </main>
  );
}

# File: app/i/[id]/page.tsx
import { getInteraction, flattenMessages, detectDuplicatePrompts } from "@/lib/supabase";
import { toLocal } from "@/lib/format";

export default async function Page({ params }: { params: { id: string } }) {
  const inter = await getInteraction(params.id);
  if (!inter) return <main>Not found</main>;
  const messages = flattenMessages(inter);
  const dupes = detectDuplicatePrompts(messages, 5);

  return (
    <main style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <section>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Messages</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {messages.map((m:any) => (
            <div key={m.msg_index} style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#666' }}>{m.role} • idx {m.msg_index} • {toLocal(m.created_at)}</div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{m.content || ''}</div>
            </div>
          ))}
        </div>
      </section>
      <aside>
        <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <h3 style={{ fontWeight: 600 }}>Meta</h3>
          <div style={{ fontSize: 14, marginTop: 6 }}>
            <div><b>id:</b> {inter.id}</div>
            <div><b>user:</b> {inter.user_id}</div>
            <div><b>model:</b> {inter.model}</div>
            <div><b>duration:</b> {Math.round(inter.total_duration_ms || 0)} ms</div>
            <div><b>created:</b> {toLocal(inter.created_at)}</div>
          </div>
        </div>
        <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 12, padding: 12 }}>
          <h3 style={{ fontWeight: 600 }}>Possible duplicates (5m window)</h3>
          {dupes.length === 0 ? (
            <div style={{ fontSize: 14, color: '#0a0' }}>None</div>
          ) : (
            <ul style={{ fontSize: 14, paddingLeft: 18 }}>
              {dupes.map((d:any) => (
                <li key={`${d.msg_index}-${d.interaction_id}`}>{(d.content || '').slice(0,120)}</li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </main>
  );
}

# File: app/metrics/page.tsx
import { listInteractions, flattenMessages, detectDuplicatePrompts } from "@/lib/supabase";

export default async function Metrics() {
  const interactions = await listInteractions({ limit: 500, hours: 24 });
  const allMsgs = interactions.flatMap(flattenMessages);
  const dupes = detectDuplicatePrompts(allMsgs, 5);
  const userMsgs = allMsgs.filter(m => m.role === 'user').length;
  const assistantMsgs = allMsgs.filter(m => m.role === 'assistant').length;

  return (
    <main>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Metrics (last 24h)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KPI label="User messages" value={userMsgs} />
        <KPI label="Assistant messages" value={assistantMsgs} />
        <KPI label="Possible duplicates" value={dupes.length} />
        <KPI label="Interactions" value={interactions.length} />
      </div>
      <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 12, padding: 12 }}>
        <h3 style={{ fontWeight: 600 }}>Duplicate prompts</h3>
        {dupes.length === 0 ? <div style={{ color: '#0a0' }}>None</div> : (
          <ul style={{ paddingLeft: 18 }}>
            {dupes.map((d:any) => (
              <li key={`${d.msg_index}-${d.interaction_id}`}>{(d.content || '').slice(0,160)}</li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function KPI({ label, value }: { label: string, value: number | string }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

# File: lib/format.ts
export function toLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-US', { hour12: false });
}

# File: lib/supabase.ts
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
