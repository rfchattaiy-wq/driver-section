'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px' }}>
          Easy Drive
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '40px' }}>
          On-demand rides and verified professional drivers. Choose your role to continue.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Rider Option */}
          <Link href="/rider/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>Book a Ride</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>Find a driver near your location</p>
              </div>
              <span style={{ fontSize: '1.5rem', color: '#38bdf8' }}>&rarr;</span>
            </div>
          </Link>

          {/* Driver Partner Option */}
          <Link href="/driver/login" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>Driver Partner</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>Register vehicle & start earning</p>
              </div>
              <span style={{ fontSize: '1.5rem', color: '#38bdf8' }}>&rarr;</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
