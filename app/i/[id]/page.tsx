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
