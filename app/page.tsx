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
