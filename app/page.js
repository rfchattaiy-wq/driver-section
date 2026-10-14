'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ n: '', p: '', t: 'Daily commute', d: '', l: '' });
  const [statusMsg, setStatusMsg] = useState({ text: '', color: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.n.trim() || !formData.p.trim() || !formData.d.trim() || !formData.l.trim()) {
      setStatusMsg({ text: 'Please fill in your name, phone, date, and pickup location.', color: '#ef4444' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('rides').insert({
      rider_name: formData.n,
      rider_phone: formData.p,
      trip_type: formData.t,
      scheduled_time: formData.d,
      pickup_location: formData.l,
      dropoff_location: 'Requested via Instant Form',
      status: 'requested',
    });

    if (error) {
      setStatusMsg({ text: 'Booking failed: ' + error.message, color: '#ef4444' });
    } else {
      setStatusMsg({ text: `Thank you, ${formData.n}. Our operations team will call you shortly to confirm your driver.`, color: '#22c55e' });
      setFormData({ n: '', p: '', t: 'Daily commute', d: '', l: '' });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7FAF9', color: '#16283A', fontFamily: 'sans-serif' }}>
      {/* SVG Symbol */}
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
      <header style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #DCE6E8', zIndex: 10, padding: '12px 20px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="42" height="30"><use href="#easydrive-mark" /></svg>
            <span style={{ fontSize: '1.4rem', fontWeight: 900 }}><b style={{ color: '#1467B8' }}>easy</b><span style={{ color: '#179469' }}>drive</span></span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => setModalOpen(true)} style={{ padding: '8px 16px', background: 'transparent', border: '2px solid #1467B8', borderRadius: '999px', color: '#1467B8', fontWeight: 700, cursor: 'pointer' }}>
              App Tutorial
            </button>
            <Link href="/rider/dashboard" style={{ padding: '8px 16px', background: 'linear-gradient(90deg,#1467B8,#179469)', color: '#fff', borderRadius: '999px', textDecoration: 'none', fontWeight: 700 }}>
              User Login
            </Link>
            <Link href="/driver/login" style={{ padding: '8px 16px', background: '#111c29', color: '#2FC18E', border: '1.5px solid #2FC18E', borderRadius: '999px', textDecoration: 'none', fontWeight: 700 }}>
              Driver Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.1, fontWeight: 900, marginBottom: '16px' }}>
              Your car. A verified driver you can trust.
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#51647A', marginBottom: '24px' }}>
              Easy Drive provides verified chauffeurs for your daily commute, late nights, or long road trips right in your private car.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #DCE6E8' }}>
                <h3 style={{ margin: '0 0 6px', color: '#1467B8' }}>Passenger</h3>
                <p style={{ margin: '0 0 12px', fontSize: '0.88rem', color: '#51647A' }}>Request a driver to handle your vehicle.</p>
                <Link href="/rider/dashboard" style={{ display: 'inline-block', padding: '8px 16px', background: '#1467B8', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
                  Book Ride
                </Link>
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #DCE6E8' }}>
                <h3 style={{ margin: '0 0 6px', color: '#179469' }}>Driver Partner</h3>
                <p style={{ margin: '0 0 12px', fontSize: '0.88rem', color: '#51647A' }}>Join as a driver and get on-demand trips.</p>
                <Link href="/driver/login" style={{ display: 'inline-block', padding: '8px 16px', background: '#111c29', color: '#2FC18E', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
                  Partner In
                </Link>
              </div>
            </div>
          </div>

          {/* Logo Card */}
          <div style={{ background: '#fff', padding: '36px', borderRadius: '28px', border: '1px solid #DCE6E8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="240" height="150" viewBox="0 0 200 130"><use href="#easydrive-mark" /></svg>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '12px 0 0' }}>
              <span style={{ color: '#1467B8' }}>easy</span><span style={{ color: '#2FC18E' }}>drive</span>
            </h2>
          </div>
        </div>

        {/* Quick Booking Form */}
        <section style={{ marginTop: '56px', background: 'linear-gradient(135deg, #0F4680, #1467B8 55%, #179469)', borderRadius: '24px', padding: '32px 24px', color: '#fff' }}>
          <h2 style={{ margin: '0 0 20px', color: '#fff' }}>Instant Driver Request</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <input required placeholder="Your Full Name" value={formData.n} onChange={e => setFormData({ ...formData, n: e.target.value })} style={{ padding: '12px', borderRadius: '10px', border: 'none' }} />
            <input required type="tel" placeholder="Phone Number" value={formData.p} onChange={e => setFormData({ ...formData, p: e.target.value })} style={{ padding: '12px', borderRadius: '10px', border: 'none' }} />
            <select value={formData.t} onChange={e => setFormData({ ...formData, t: e.target.value })} style={{ padding: '12px', borderRadius: '10px', border: 'none' }}>
              <option>Daily commute</option>
              <option>Night travel</option>
              <option>Outstation trip</option>
            </select>
            <input required type="datetime-local" value={formData.d} onChange={e => setFormData({ ...formData, d: e.target.value })} style={{ padding: '12px', borderRadius: '10px', border: 'none' }} />
            <input required placeholder="Pickup Location (Landmark/Address)" value={formData.l} onChange={e => setFormData({ ...formData, l: e.target.value })} style={{ padding: '12px', borderRadius: '10px', border: 'none', gridColumn: '1 / -1' }} />
            <button type="submit" disabled={loading} style={{ gridColumn: '1 / -1', padding: '14px', borderRadius: '10px', background: '#fff', color: '#0F4680', fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
              {loading ? 'Submitting Request...' : 'Request a Driver Now'}
            </button>
          </form>
          {statusMsg.text && <p style={{ marginTop: '16px', fontWeight: 700, color: statusMsg.color }}>{statusMsg.text}</p>}
        </section>
      </main>

      {/* Tutorial Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(9, 20, 33, 0.7)', display: 'grid', placeItems: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1467B8' }}>How Easy Drive Works</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem', color: '#51647A' }}>
              <p><strong>1. For Passengers:</strong> Sign in with Google, submit pickup point and trip schedule. Verified chauffeurs accept and arrive directly at your location.</p>
              <p><strong>2. For Drivers:</strong> Log in with Google, complete the verification onboarding with your license number and document upload.</p>
              <p><strong>3. Safe Driving:</strong> The chauffeur exclusively drives your car—no vehicle transfers or fleet charges.</p>
            </div>
            <button onClick={() => setModalOpen(false)} style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#1467B8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
