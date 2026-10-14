'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tripType: 'Daily commute',
    pickup: '',
    dropoff: '',
    time: ''
  });
  const [statusMsg, setStatusMsg] = useState({ text: '', color: '' });
  const [loading, setLoading] = useState(false);
  const [bookingTicket, setBookingTicket] = useState(null);

  // അഡ്മിന്റെ WhatsApp നമ്പർ
  const ADMIN_WHATSAPP_NUMBER = '916238775403';

  const currentDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  const validateForm = () => {
    const { name, phone, pickup, dropoff, time } = formData;
    if (name.trim().length < 3) return 'ദയവായി സാധുവായ പേര് നൽകുക (കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ).';
    if (!/^[6-9]\d{9}$/.test(phone.trim())) return 'സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.';
    if (pickup.trim().length < 3) return 'പിക്കപ്പ് സ്ഥലം നൽകുക.';
    if (dropoff.trim().length < 3) return 'ഡ്രോപ്പ് സ്ഥലം നൽകുക.';
    if (!time) return 'യാത്രാ സമയവും തീയതിയും നൽകുക.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ text: '', color: '' });

    const error = validateForm();
    if (error) {
      setStatusMsg({ text: error, color: '#ef4444' });
      return;
    }

    setLoading(true);

    const bookingId = 'ED-' + Math.floor(100000 + Math.random() * 900000);

    const { error: insertError } = await supabase.from('rides').insert({
      rider_name: formData.name.trim(),
      rider_phone: formData.phone.trim(),
      trip_type: formData.tripType,
      scheduled_time: formData.time,
      pickup_location: formData.pickup.trim(),
      dropoff_location: formData.dropoff.trim(),
      status: 'requested',
    });

    if (insertError) {
      setStatusMsg({ text: 'ബുക്കിംഗ് പരാജയപ്പെട്ടു: ' + insertError.message, color: '#ef4444' });
    } else {
      setBookingTicket({
        id: bookingId,
        ...formData
      });
      setStatusMsg({
        text: 'ബുക്കിംഗ് രജിസ്റ്റർ ചെയ്തു! കൺഫർമേഷൻ ഉറപ്പാക്കാൻ താഴെയുള്ള WhatsApp ടിക്കറ്റ് അയക്കുക.',
        color: '#22c55e'
      });
      setFormData({ name: '', phone: '', tripType: 'Daily commute', pickup: '', dropoff: '', time: '' });
    }
    setLoading(false);
  };

  const getWhatsAppMessageUrl = () => {
    if (!bookingTicket) return '#';
    const msg = `📋 *EASY DRIVE - OFFICIAL BOOKING REQUEST*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🎫 *Booking ID:* #${bookingTicket.id}\n` +
      `👤 *കസ്റ്റമർ:* ${bookingTicket.name}\n` +
      `📞 *ഫോൺ:* ${bookingTicket.phone}\n` +
      `📍 *പിക്കപ്പ്:* ${bookingTicket.pickup}\n` +
      `🏁 *ഡ്രോപ്പ്:* ${bookingTicket.dropoff}\n` +
      `🕒 *സമയം:* ${new Date(bookingTicket.time).toLocaleString('en-IN')}\n` +
      `🚗 *വിഭാഗം:* ${bookingTicket.tripType}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `*ഡ്രൈവർ അലോക്കേഷനായി ഈ വിവരങ്ങൾ ഗ്രൂപ്പിലേക്ക് ഫോർവേഡ് ചെയ്യുക.*`;
    return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7FAF9', color: '#16283A', fontFamily: 'sans-serif' }}>
      
      {/* ഒറിജിനൽ ലോഗോ ചിഹ്നം (SVG Definition) */}
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
          
          {/* ലോഗോ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="42" height="30"><use href="#easydrive-mark" /></svg>
            <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>
              <b style={{ color: '#1467B8' }}>easy</b><span style={{ color: '#179469' }}>drive</span>
            </span>
          </div>

          {/* നാവിഗേഷൻ മെനു */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setModalOpen(true)} style={{ padding: '8px 14px', background: 'transparent', border: '1.5px solid #1467B8', borderRadius: '999px', color: '#1467B8', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
              Tutorial
            </button>
            <Link href="/rider/login" style={{ padding: '8px 16px', background: 'linear-gradient(90deg,#1467B8,#179469)', color: '#fff', borderRadius: '999px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem' }}>
              User Login
            </Link>
            <Link href="/driver/login" style={{ padding: '8px 16px', background: '#111c29', color: '#2FC18E', border: '1.5px solid #2FC18E', borderRadius: '999px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem' }}>
              Driver Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero & Logo Showcase Section */}
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', lineHeight: 1.15, fontWeight: 900, marginBottom: '16px' }}>
              Your car. A verified driver you can trust.
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#51647A', marginBottom: '24px' }}>
              നിങ്ങളുടെ സ്വന്തം കാർ ഓടിക്കാൻ പശ്ചാത്തലം പരിശോധിച്ചുറപ്പിച്ച വിശ്വസ്തരായ ഡ്രൈവർമാർ.
            </p>
          </div>

          {/* വലിയ ലോഗോ കാർഡ് */}
          <div style={{ background: '#fff', padding: '36px', borderRadius: '28px', border: '1px solid #DCE6E8', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
            <svg width="220" height="140" viewBox="0 0 200 130"><use href="#easydrive-mark" /></svg>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '12px 0 0' }}>
              <span style={{ color: '#1467B8' }}>easy</span><span style={{ color: '#2FC18E' }}>drive</span>
            </h2>
          </div>
        </div>

        {/* Booking Form Card */}
        <section style={{ maxWidth: '600px', margin: '40px auto 0', background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #DCE6E8', boxShadow: '0 10px 35px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 6px', color: '#1467B8', fontSize: '1.35rem' }}>ബുക്കിംഗ് റിക്വസ്റ്റ്</h2>
          <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '0.88rem' }}>യാത്രാ വിവരങ്ങൾ നൽകി വേഗത്തിൽ ഡ്രൈവറെ കണ്ടെത്തുക</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>പൂർണ്ണ നാമം</label>
              <input required placeholder="ഉദാ: Akash Prakash" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>മൊബൈൽ നമ്പർ (10 അക്കങ്ങൾ)</label>
              <input required type="tel" maxLength={10} placeholder="9876543210" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>പിക്കപ്പ് സ്ഥലം</label>
                <input required placeholder="ഉദാ: Aluva" value={formData.pickup} onChange={e => setFormData({ ...formData, pickup: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>ഡ്രോപ്പ് സ്ഥലം</label>
                <input required placeholder="ഉദാ: Kakkanad" value={formData.dropoff} onChange={e => setFormData({ ...formData, dropoff: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>യാത്രാ വിഭാഗം</label>
                <select value={formData.tripType} onChange={e => setFormData({ ...formData, tripType: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', background: '#fff' }}>
                  <option>Daily commute</option>
                  <option>Night travel</option>
                  <option>Outstation trip</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>യാത്രാ സമയം</label>
                <input required type="datetime-local" min={currentDateTime} value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: '8px', padding: '13px', borderRadius: '10px', background: 'linear-gradient(90deg,#1467B8,#179469)', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
              {loading ? 'റിക്വസ്റ്റ് അയക്കുന്നു...' : 'ഡ്രൈവറെ റിക്വസ്റ്റ് ചെയ്യുക'}
            </button>
          </form>

          {/* ഔദ്യോഗിക ബുക്കിംഗ് ടിക്കറ്റ് കാർഡ് */}
          {bookingTicket && (
            <div style={{ marginTop: '20px', padding: '18px', background: '#F0FDF4', borderRadius: '14px', border: '1.5px solid #22c55e', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 700, marginBottom: '6px' }}>
                ✅ ബുക്കിംഗ് രജിസ്റ്റർ ചെയ്തു! (ID: #{bookingTicket.id})
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#15803d' }}>
                ഡ്രൈവർ അലോക്കേഷൻ പൂർത്തിയാക്കാൻ ഔദ്യോഗിക ടിക്കറ്റ് വാട്സ്ആപ്പിൽ അഡ്മിന് കൈമാറുക:
              </p>
              <a
                href={getWhatsAppMessageUrl()}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-block', width: '100%', padding: '13px', background: '#25D366', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 900, boxSizing: 'border-box', fontSize: '0.95rem' }}
              >
                💬 വാട്സ്ആപ്പിൽ ടിക്കറ്റ് അയക്കുക (6238775403)
              </a>
            </div>
          )}

          {statusMsg.text && !bookingTicket && (
            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', fontSize: '0.9rem', fontWeight: 600 }}>
              {statusMsg.text}
            </div>
          )}
        </section>
      </main>

      {/* Tutorial Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(9, 20, 33, 0.7)', display: 'grid', placeItems: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '440px', width: '100%' }}>
            <h3 style={{ margin: '0 0 10px', color: '#1467B8' }}>How Easy Drive Works</h3>
            <p style={{ fontSize: '0.9rem', color: '#51647A', lineHeight: 1.5 }}>
              1. പിക്കപ്പ്, ഡ്രോപ്പ് വിവരങ്ങൾ നൽകി ബുക്ക് ചെയ്യുക.<br />
              2. അഡ്മിൻ വിവരങ്ങൾ പരിശോധിച്ചുറപ്പിച്ച് വേരിഫൈഡ് ഡ്രൈവറെ അസൈൻ ചെയ്യും.
            </p>
            <button onClick={() => setModalOpen(false)} style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#1467B8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
