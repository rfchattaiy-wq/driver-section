'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tripType: 'Daily commute',
    dateTime: '',
    pickup: '',
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.dateTime || !formData.pickup) {
      setStatusMsg('Please fill in your name, phone, date and pickup location.');
      return;
    }

    setLoading(true);
    setStatusMsg('');

    // Supabase ഡാറ്റാബേസിലേക്ക് സേവ് ചെയ്യുന്നു
    const { error } = await supabase.from('bookings').insert([
      {
        customer_name: formData.name,
        customer_phone: formData.phone,
        pickup_location: formData.pickup,
        pickup_date: formData.dateTime,
        transmission_type: formData.tripType,
      },
    ]);

    setLoading(false);

    if (error) {
      setStatusMsg('Error: ' + error.message);
    } else {
      setStatusMsg(`Thanks, ${formData.name}. Redirecting to WhatsApp...`);
      
      // WhatsApp റീഡയറക്റ്റ്
      const msg = encodeURIComponent(
        `New Driver Booking Request:\nName: ${formData.name}\nPhone: ${formData.phone}\nTrip: ${formData.tripType}\nPickup: ${formData.pickup}\nDate & Time: ${formData.dateTime}`
      );
      
      setTimeout(() => {
        // നിങ്ങളുടെ വാട്സ്ആപ്പ് നമ്പർ ആവശ്യമെങ്കിൽ 919999999999 മാറ്റി നൽകാം
        window.location.href = `https://wa.me/919999999999?text=${msg}`;
      }, 1000);
    }
  };

  return (
    <div className="page-wrapper">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="g" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#1769B5" />
            <stop offset="55%" stopColor="#1F86B8" />
            <stop offset="100%" stopColor="#3EC59B" />
          </linearGradient>
        </defs>
        <symbol id="mark" viewBox="0 0 120 90">
          <path
            d="M10 82 C14 56 34 40 58 44 C84 48 94 26 72 14 C54 6 34 18 34 36 C34 56 56 70 80 62 C92 58 100 50 106 40"
            fill="none"
            stroke="url(#g)"
            strokeWidth="15"
            strokeLinecap="butt"
          />
          <path
            className="road-dash"
            d="M10 82 C14 56 34 40 58 44 C84 48 94 26 72 14 C54 6 34 18 34 36 C34 56 56 70 80 62 C92 58 100 50 106 40"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            opacity=".9"
          />
          <path d="M110 22 L112 52 L90 42 Z" fill="#1769B5" />
        </symbol>
      </svg>

      <header>
        <div className="wrap header-wrap">
          <a className="brand" href="#top" aria-label="Easy Drive home">
            <svg width="44" height="34" aria-hidden="true"><use href="#mark" /></svg>
            <span><b>easy</b><span className="brand-green">drive</span></span>
          </a>
          <nav aria-label="Main">
            <a href="#services">Services</a>
            <a href="#how">How it works</a>
            <a href="#book">Book</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-wrap">
            <div>
              <h1>Your car. A driver you can trust.</h1>
              <p className="hero-desc">
                Easy Drive sends a background-verified driver to drive your own car. Daily commutes, late nights, long trips. You relax, we handle the road.
              </p>
              <div className="cta">
                <a className="btn" href="#book">Book a driver</a>
                <a className="btn alt" href="#how">See how it works</a>
              </div>
            </div>
            <div className="logo-card">
              <svg viewBox="0 0 360 250" role="img" aria-label="Easy Drive logo">
                <g transform="translate(70 0) scale(1.9)"><use href="#mark" width="120" height="90" /></g>
                <text x="180" y="226" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="64" letterSpacing="-2">
                  <tspan fill="#1769B5">easy</tspan>
                  <tspan fill="#3EC59B">drive</tspan>
                </text>
              </svg>
            </div>
          </div>
        </section>

        <section id="services">
          <div className="wrap">
            <h2>Drivers for every kind of trip</h2>
            <div className="grid three">
              <div className="card"><h3>Daily commute</h3><p>A regular driver for office runs and school drop-offs, on your schedule.</p></div>
              <div className="card"><h3>Night travel</h3><p>Get home safely after dinners, parties and late flights.</p></div>
              <div className="card"><h3>Outstation trips</h3><p>Experienced highway drivers for long journeys, one way or round trip.</p></div>
            </div>
          </div>
        </section>

        <section id="how">
          <div className="wrap">
            <h2>How it works</h2>
            <ol className="steps">
              <li><strong>Tell us your trip</strong>Pick the date, time and pickup point.</li>
              <li><strong>We assign a driver</strong>Verified, trained and matched to your trip.</li>
              <li><strong>Sit back</strong>The driver arrives, takes the wheel and gets you there.</li>
            </ol>
          </div>
        </section>

        <section>
          <div className="wrap grid two">
            <div className="card"><h3>Verified every time</h3><p>Identity, address and police checks before any driver joins.</p></div>
            <div className="card"><h3>Your car stays yours</h3><p>No rentals or swaps. Just a careful driver behind your own wheel.</p></div>
          </div>
        </section>

        <section id="book">
          <div className="wrap">
            <div className="book">
              <h2>Book a driver</h2>
              <form onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="n">Full name</label>
                  <input
                    id="n"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="p">Phone number</label>
                  <input
                    id="p"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="t">Trip type</label>
                  <select
                    id="t"
                    value={formData.tripType}
                    onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
                  >
                    <option>Daily commute</option>
                    <option>Night travel</option>
                    <option>Outstation trip</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="d">Date and time</label>
                  <input
                    id="d"
                    type="datetime-local"
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  />
                </div>
                <div className="full">
                  <label htmlFor="l">Pickup location</label>
                  <input
                    id="l"
                    required
                    value={formData.pickup}
                    onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                  />
                </div>
                <div className="full">
                  <button className="btn form-btn" type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Request a driver'}
                  </button>
                </div>
              </form>
              {statusMsg && <div className="msg" role="status">{statusMsg}</div>}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap footer-wrap">
          <a className="brand footer-brand" href="#top">
            <svg width="34" height="26" aria-hidden="true"><use href="#mark" /></svg>
            <span><b>easy</b><span className="brand-green">drive</span></span>
          </a>
          <span>&copy; 2026 Easy Drive. All rights reserved.</span>
        </div>
      </footer>

      {/* Styles inline to preserve exactly your CSS */}
      <style jsx global>{`
        :root {
          --blue: #1769B5; --blue-d: #0F4C85; --green: #3EC59B; --green-d: #1F9E78;
          --bg: #F7FAF9; --card: #fff; --text: #16283A; --muted: #51647A; --line: #DCE6E8;
        }
        * { box-sizing: border-box; }
        body { margin: 0; background: var(--bg); color: var(--text); font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
        a { color: inherit; }
        .wrap { max-width: 1040px; margin: 0 auto; padding: 0 20px; }
        header { position: sticky; top: 0; background: var(--bg); border-bottom: 1px solid var(--line); z-index: 5; }
        .header-wrap { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; padding-bottom: 10px; }
        .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; font-weight: 900; font-size: 1.5rem; letter-spacing: -.02em; }
        .brand b { color: var(--blue); }
        .brand-green { color: var(--green-d); }
        nav { display: flex; gap: 18px; font-weight: 700; font-size: .95rem; }
        nav a { text-decoration: none; color: var(--muted); }
        nav a:hover { color: var(--blue); }
        .btn { display: inline-block; border: 0; border-radius: 999px; padding: 13px 26px; font-weight: 900; font-size: 1rem; cursor: pointer; text-decoration: none; color: #fff; background: linear-gradient(90deg, var(--blue), var(--green-d)); text-align: center; }
        .btn.alt { background: transparent; color: var(--blue); box-shadow: inset 0 0 0 2px var(--blue); }
        .hero { padding: 56px 0 48px; }
        .hero-wrap { display: grid; gap: 32px; align-items: center; }
        @media (min-width: 800px) { .hero-wrap { grid-template-columns: 1.1fr .9fr; } }
        h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.05; margin: 0 0 16px; letter-spacing: -.03em; font-weight: 900; }
        .hero-desc { font-size: 1.15rem; color: var(--muted); max-width: 34em; margin: 0 0 26px; }
        .cta { display: flex; flex-wrap: wrap; gap: 12px; }
        .logo-card { background: var(--card); border: 1px solid var(--line); border-radius: 28px; padding: 28px; display: grid; place-items: center; }
        .logo-card svg { width: 100%; max-width: 360px; height: auto; }
        section { padding: 48px 0; }
        h2 { font-size: clamp(1.7rem, 4vw, 2.4rem); margin: 0 0 24px; letter-spacing: -.02em; font-weight: 900; }
        .grid { display: grid; gap: 16px; }
        @media (min-width: 700px) { .grid.three { grid-template-columns: repeat(3, 1fr); } .grid.two { grid-template-columns: 1fr 1fr; } }
        .card { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 22px; }
        .card h3 { margin: 0 0 6px; font-size: 1.15rem; color: var(--blue); }
        .card p { margin: 0; color: var(--muted); }
        .steps { counter-reset: s; list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
        @media (min-width: 700px) { .steps { grid-template-columns: repeat(3, 1fr); } }
        .steps li { counter-increment: s; background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 22px; position: relative; }
        .steps li::before { content: counter(s); display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: var(--green); color: #0b2a21; font-weight: 900; margin-bottom: 10px; }
        .steps strong { display: block; color: var(--blue); margin-bottom: 4px; }
        .book { background: linear-gradient(135deg, var(--blue-d), var(--blue) 55%, var(--green-d)); color: #fff; border-radius: 28px; padding: 32px 22px; }
        .book h2 { color: #fff; }
        form { display: grid; gap: 14px; }
        @media (min-width: 700px) { form { grid-template-columns: 1fr 1fr; } .full { grid-column: 1 / -1; } }
        label { display: block; font-weight: 700; margin-bottom: 5px; font-size: .95rem; }
        input, select { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid transparent; font-size: 1rem; background: #fff; color: #16283A; }
        .book .form-btn { background: #fff; color: var(--blue-d); width: 100%; }
        .msg { margin-top: 14px; font-weight: 700; min-height: 1.5em; color: #fff; }
        footer { padding: 28px 0 36px; color: var(--muted); font-size: .9rem; border-top: 1px solid var(--line); }
        .footer-wrap { display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center; }
        .footer-brand { font-size: 1.2rem; }
        .road-dash { stroke-dasharray: 6 7; animation: d 1.2s linear infinite; }
        @keyframes d { to { stroke-dashoffset: -26; } }
      `}</style>
    </div>
  );
}
