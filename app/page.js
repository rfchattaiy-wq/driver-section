'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ n: '', p: '', t: 'Daily commute', d: '' });
  const [locationQuery, setLocationQuery] = useState('');
  const [verifiedLocation, setVerifiedLocation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', color: '' });
  const [loading, setLoading] = useState(false);

  const currentDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  useEffect(() => {
    if (locationQuery.trim().length < 3 || verifiedLocation?.display_name === locationQuery) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLoc(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(locationQuery)}&limit=5`
        );
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error('Loc error:', err);
      } finally {
        setIsSearchingLoc(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [locationQuery, verifiedLocation]);

  const handleSelectPlace = (place) => {
    setVerifiedLocation(place);
    setLocationQuery(place.display_name);
    setSuggestions([]);
  };

  const validateBookingForm = () => {
    if (!/^[a-zA-Z\s]{3,40}$/.test(formData.n.trim())) {
      return 'സാധുവായ ഒരു പേര് നൽകുക (കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ).';
    }
    if (!/^[6-9]\d{9}$/.test(formData.p.trim())) {
      return 'സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.';
    }
    if (!formData.d.trim()) {
      return 'തീയതിയും സമയവും തിരഞ്ഞെടുക്കുക.';
    }
    if (new Date(formData.d) < new Date()) {
      return 'ഭാവിയിലുള്ള സമയം നൽകുക.';
    }
    if (!verifiedLocation) {
      return 'സ്ഥലം ടൈപ്പ് ചെയ്യുമ്പോൾ താഴെ കാണിക്കുന്ന ലിസ്റ്റിൽ നിന്ന് ക്ലിക്ക് ചെയ്ത് സെലക്ട് ചെയ്യുക.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ text: '', color: '' });

    const err = validateBookingForm();
    if (err) {
      setStatusMsg({ text: err, color: '#ef4444' });
      return;
    }

    setLoading(true);
    const { error: insertError } = await supabase.from('rides').insert({
      rider_name: formData.n.trim(),
      rider_phone: formData.p.trim(),
      trip_type: formData.t,
      scheduled_time: formData.d,
      pickup_location: verifiedLocation.display_name,
      dropoff_location: 'സ്ഥിരീകരണ കോളിൽ അറിയിക്കുക',
      status: 'requested',
    });

    if (insertError) {
      setStatusMsg({ text: 'ബുക്കിംഗ് പരാജയപ്പെട്ടു: ' + insertError.message, color: '#ef4444' });
    } else {
      setStatusMsg({
        text: `നന്ദി! ബുക്കിംഗ് രജിസ്റ്റർ ചെയ്തു: ${verifiedLocation.display_name}`,
        color: '#22c55e'
      });
      setFormData({ n: '', p: '', t: 'Daily commute', d: '' });
      setLocationQuery('');
      setVerifiedLocation(null);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7FAF9', color: '#16283A', fontFamily: 'sans-serif' }}>
      <header style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #DCE6E8', zIndex: 10, padding: '12px 20px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>
            <b style={{ color: '#1467B8' }}>easy</b><span style={{ color: '#179469' }}>drive</span>
          </span>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setModalOpen(true)} style={{ padding: '8px 16px', background: 'transparent', border: '2px solid #1467B8', borderRadius: '999px', color: '#1467B8', fontWeight: 700, cursor: 'pointer' }}>
              Tutorial
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

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '12px' }}>
          Your car. A verified driver you can trust.
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#51647A', marginBottom: '28px' }}>
          നിങ്ങളുടെ സ്വന്തം കാർ ഓടിക്കാൻ പശ്ചാത്തലം പരിശോധിച്ചുറപ്പിച്ച വിശ്വസ്തരായ ഡ്രൈവർമാർ.
        </p>

        <section style={{ background: 'linear-gradient(135deg, #0F4680, #1467B8 55%, #179469)', borderRadius: '24px', padding: '32px 24px', color: '#fff' }}>
          <h2 style={{ margin: '0 0 6px', color: '#fff' }}>Instant Driver Request</h2>
          <p style={{ margin: '0 0 20px', color: '#e0f2fe', fontSize: '0.95rem' }}>സ്ഥലവും സമയവും നൽകി ഡ്രൈവറെ റിക്വസ്റ്റ് ചെയ്യുക</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>പേര്</label>
              <input required placeholder="Akash Prakash" value={formData.n} onChange={e => setFormData({ ...formData, n: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>മൊബൈൽ നമ്പർ</label>
              <input required type="tel" maxLength={10} placeholder="9876543210" value={formData.p} onChange={e => setFormData({ ...formData, p: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>യാത്രാ വിഭാഗം</label>
              <select value={formData.t} onChange={e => setFormData({ ...formData, t: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', boxSizing: 'border-box' }}>
                <option>Daily commute</option>
                <option>Night travel</option>
                <option>Outstation trip</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>യാത്രാ സമയം</label>
              <input required type="datetime-local" min={currentDateTime} value={formData.d} onChange={e => setFormData({ ...formData, d: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                പിക്കപ്പ് ലൊക്കേഷൻ (താഴെ വരുന്ന ലിസ്റ്റിൽ നിന്ന് സെലക്ട് ചെയ്യുക)
              </label>
              <input
                required
                placeholder="സ്ഥലപ്പേര് അടിക്കുക (ഉദാ: Edappally, Aluva, Ernakulam...)"
                value={locationQuery}
                onChange={e => { setLocationQuery(e.target.value); setVerifiedLocation(null); }}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: verifiedLocation ? '2px solid #22c55e' : 'none', boxSizing: 'border-box' }}
              />

              {isSearchingLoc && (
                <div style={{ position: 'absolute', zIndex: 30, background: '#fff', color: '#334155', width: '100%', padding: '8px 12px', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}>
                  സ്ഥലങ്ങൾ പരിശോധിക്കുന്നു...
                </div>
              )}

              {suggestions.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 40, background: '#fff', color: '#1e293b', width: '100%', borderRadius: '10px', marginTop: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectPlace(item)}
                      style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      📍 <strong>{item.display_name.split(',')[0]}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{item.display_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} style={{ gridColumn: '1 / -1', padding: '14px', borderRadius: '10px', background: '#fff', color: '#0F4680', fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: '1rem', marginTop: '6px' }}>
              {loading ? 'റിക്വസ്റ്റ് അയക്കുന്നു...' : 'ഡ്രൈവറെ റിക്വസ്റ്റ് ചെയ്യുക'}
            </button>
          </form>

          {statusMsg.text && (
            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: statusMsg.color === '#22c55e' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1.5px solid ${statusMsg.color}`, color: '#fff', fontWeight: 700 }}>
              {statusMsg.text}
            </div>
          )}
        </section>
      </main>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(9, 20, 33, 0.7)', display: 'grid', placeItems: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '460px', width: '100%' }}>
            <h3 style={{ margin: '0 0 12px', color: '#1467B8' }}>How Easy Drive Works</h3>
            <p style={{ fontSize: '0.92rem', color: '#51647A' }}>ലൊക്കേഷനും സമയവും നൽകി ഡ്രൈവറെ വിളിക്കുക. വെരിഫൈഡ് ഡ്രൈവർ നിങ്ങളുടെ കാർ ഓടിക്കാൻ എത്തും.</p>
            <button onClick={() => setModalOpen(false)} style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#1467B8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
