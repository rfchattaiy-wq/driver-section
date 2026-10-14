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
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // അഡ്മിന്റെ WhatsApp നമ്പർ (രാജ്യ കോഡ് 91 സഹിതം)
  const ADMIN_WHATSAPP_NUMBER = '916238775403';

  const currentDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  const validateForm = () => {
    const { name, phone, pickup, dropoff, time } = formData;
    if (name.trim().length < 3) return 'സാധുവായ പേര് നൽകുക (കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ).';
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
      setBookingSuccessData({ ...formData });
      setStatusMsg({
        text: 'ബുക്കിംഗ് വിജയകരമായി രേഖപ്പെടുത്തി! ഡ്രൈവറെ വേഗത്തിൽ ഉറപ്പാക്കാൻ താഴെയുള്ള WhatsApp ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.',
        color: '#22c55e'
      });
      setFormData({ name: '', phone: '', tripType: 'Daily commute', pickup: '', dropoff: '', time: '' });
    }
    setLoading(false);
  };

  // അഡ്മിന് WhatsApp അയക്കാനുള്ള ലിങ്ക്
  const getWhatsAppMessageUrl = () => {
    if (!bookingSuccessData) return '#';
    const msg = `*പുതിയ യാത്രാ റിക്വസ്റ്റ് (Easy Drive)*\n\n` +
      `👤 *യാത്രക്കാരൻ:* ${bookingSuccessData.name}\n` +
      `📞 *ഫോൺ:* ${bookingSuccessData.phone}\n` +
      `📍 *പിക്കപ്പ്:* ${bookingSuccessData.pickup}\n` +
      `🏁 *ഡ്രോപ്പ്:* ${bookingSuccessData.dropoff}\n` +
      `🕒 *സമയം:* ${new Date(bookingSuccessData.time).toLocaleString('en-IN')}\n` +
      `🚗 *വിഭാഗം:* ${bookingSuccessData.tripType}`;
    return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7FAF9', color: '#16283A', fontFamily: 'sans-serif' }}>
      <header style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #DCE6E8', zIndex: 10, padding: '14px 20px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>
            <b style={{ color: '#1467B8' }}>easy</b><span style={{ color: '#179469' }}>drive</span>
          </span>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setModalOpen(true)} style={{ padding: '8px 16px', background: 'transparent', border: '1.5px solid #1467B8', borderRadius: '999px', color: '#1467B8', fontWeight: 700, cursor: 'pointer' }}>
              How it works
            </button>
            <Link href="/driver/login" style={{ padding: '8px 16px', background: '#111c29', color: '#2FC18E', border: '1.5px solid #2FC18E', borderRadius: '999px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
              Driver Portal
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 12px', color: '#1467B8' }}>
            Your Car. A Verified Driver.
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#51647A', margin: 0 }}>
            നിങ്ങളുടെ സ്വന്തം വാഹനം ഓടിക്കാൻ വിശ്വസ്തരായ ഡ്രൈവർമാരെ ഉടൻ കണ്ടെത്തുക.
          </p>
        </div>

        <section style={{ maxWidth: '560px', margin: '0 auto', background: '#fff', borderRadius: '24px', padding: '28px', border: '1px solid #DCE6E8', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 6px', color: '#1467B8', fontSize: '1.3rem' }}>ബുക്കിംഗ് റിക്വസ്റ്റ്</h2>
          <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '0.88rem' }}>വിവരങ്ങൾ പൂരിപ്പിച്ച് ഡ്രൈവറെ ഉറപ്പാക്കുക</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>പേര്</label>
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

          {/* WhatsApp Direct Confirmation Button */}
          {bookingSuccessData && (
            <div style={{ marginTop: '20px', padding: '18px', background: '#F0FDF4', borderRadius: '14px', border: '1.5px solid #22c55e', textAlign: 'center' }}>
              <p style={{ margin: '0 0 12px', fontWeight: 700, color: '#166534', fontSize: '0.95rem' }}>
                ✅ ബുക്കിംഗ് രേഖപ്പെടുത്തി! വിവരങ്ങൾ അഡ്മിന് കൈമാറി വേഗത്തിൽ ഡ്രൈവറെ ലഭിക്കാൻ താഴെ ക്ലിക്ക് ചെയ്യുക:
              </p>
              <a
                href={getWhatsAppMessageUrl()}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-block', width: '100%', padding: '13px', background: '#25D366', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 900, boxSizing: 'border-box', fontSize: '1rem' }}
              >
                💬 വാട്സ്ആപ്പിൽ അഡ്മിനെ അറിയിക്കുക (6238775403)
              </a>
            </div>
          )}

          {statusMsg.text && !bookingSuccessData && (
            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', fontSize: '0.9rem', fontWeight: 600 }}>
              {statusMsg.text}
            </div>
          )}
        </section>
      </main>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(9, 20, 33, 0.7)', display: 'grid', placeItems: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '440px', width: '100%' }}>
            <h3 style={{ margin: '0 0 10px', color: '#1467B8' }}>How Easy Drive Works</h3>
            <p style={{ fontSize: '0.9rem', color: '#51647A', lineHeight: 1.5 }}>
              1. പിക്കപ്പ്, ഡ്രോപ്പ് വിവരങ്ങൾ നൽകി ബുക്ക് ചെയ്യുക.<br />
              2. അഡ്മിൻ വിവരങ്ങൾ പരിശോധിച്ച് ഡ്രൈവറെ അസൈൻ ചെയ്യും.
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
