'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'sans-serif' }}>
      
      {/* ഒറിജിനൽ SVG ലോഗോ */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="roadGrad" x1="0%" y1="70%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#1467B8" />
            <stop offset="55%" stopColor="#1B9AB0" />
            <stop offset="100%" stopColor="#2FC18E" />
          </linearGradient>
        </defs>
        <symbol id="easydrive-mark" viewBox="0 0 200 130">
          <path d="M 28 105 C 42 70, 72 45, 112 48 C 142 50, 150 18, 118 10 C 86 2, 74 38, 74 62 C 74 96, 115 108, 142 98 C 158 92, 172 78, 182 60" fill="none" stroke="url(#roadGrad)" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 28 105 C 42 70, 72 45, 112 48 C 142 50, 150 18, 118 10 C 86 2, 74 38, 74 62 C 74 96, 115 108, 142 98 C 158 92, 172 78, 182 60" fill="none" stroke="#FFFFFF" strokeWidth="2.3" strokeDasharray="6 7" strokeLinecap="round" opacity="0.95" />
          <polygon points="172,32 196,52 170,72 175,54 158,52" fill="#2FC18E" />
        </symbol>
      </svg>

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="42" height="30"><use href="#easydrive-mark" /></svg>
          <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>
            <b style={{ color: '#1467B8' }}>easy</b><span style={{ color: '#179469' }}>drive</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/rider/login" style={{ padding: '9px 18px', background: '#1467B8', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
            User Login
          </Link>
          <Link href="/driver/login" style={{ padding: '9px 18px', background: '#0F172A', color: '#2FC18E', border: '1px solid #2FC18E', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
            Driver Portal
          </Link>
        </div>
      </header>

      {/* Hero Welcome Screen */}
      <main style={{ maxWidth: '800px', margin: '60px auto 20px', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ background: '#fff', padding: '40px 24px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
          <svg width="180" height="110" viewBox="0 0 200 130"><use href="#easydrive-mark" /></svg>
          
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '20px 0 10px', color: '#0F172A' }}>
            Your Car. A Verified Driver.
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            നിങ്ങളുടെ കാർ ഓടിക്കാൻ വിശ്വസ്തരായ പ്രൊഫഷണൽ ഡ്രൈവർമാരെ കണ്ടെത്തൂ. തുടരുന്നതിന് താഴെ ലോഗിൻ ചെയ്യുക:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '340px', margin: '0 auto' }}>
            <Link href="/rider/login" style={{ padding: '14px', background: 'linear-gradient(90deg, #1467B8, #179469)', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '1.05rem', boxShadow: '0 4px 12px rgba(20, 103, 184, 0.25)' }}>
              🚗 ബുക്കിംഗിനായി പ്രവേശിക്കുക (User)
            </Link>
            
            <Link href="/driver/login" style={{ padding: '12px', background: '#fff', color: '#334155', border: '1.5px solid #CBD5E1', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>
              ഡ്രൈവർ രജിസ്ട്രേഷൻ / ലോഗിൻ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
