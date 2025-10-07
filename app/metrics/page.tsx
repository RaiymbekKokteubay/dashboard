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
