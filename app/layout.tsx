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
