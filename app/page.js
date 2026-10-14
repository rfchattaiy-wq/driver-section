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

  // മിനിമം സമയം - ഇപ്പോൾ ഉള്ള സമയം
  const currentDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  const validateForm = () => {
    const { name, phone, pickup, dropoff, time } = formData;

    if (name.trim().length < 3) {
      return 'ദയവായി നിങ്ങളുടെ പേര് നൽകുക (കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ).';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      return 'സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക (6-9 ൽ ആരംഭിക്കുന്നത്).';
    }

    if (pickup.trim().length < 4) {
      return 'കൃത്യമായ പിക്കപ്പ് സ്ഥലം നൽകുക.';
    }

    if (dropoff.trim().length < 4) {
      return 'കൃത്യമായ ഡ്രോപ്പ് സ്ഥലം നൽകുക.';
    }

    if (!time) {
      return 'യാത്രാ തീയതിയും സമയവും തിരഞ്ഞെടുക്കുക.';
    }

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
      setStatusMsg({
        text: `നന്ദി ${formData.name}! നിങ്ങളുടെ ബുക്കിംഗ് വിജയകരമായി രജിസ്റ്റർ ചെയ്തു. ഒരു ഡ്രൈവർ ഉടൻ ട്രിപ്പ് സ്വീകരിക്കുന്നതാണ്.`,
        color: '#22c55e'
      });
      setFormData({
        name: '',
        phone: '',
        tripType: 'Daily commute',
        pickup: '',
        dropoff: '',
        time: ''
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7FAF9', color: '#16283A', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #DCE6E8', zIndex: 10, padding: '14px 20px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>
            <b style={{ color: '#1467B8' }}>easy</b><span style={{ color: '#179469' }}>drive</span>
          </span>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setModalOpen(true)} style={{ padding: '8px 16px', background: 'transparent', border: '1.5px solid #1467B8', borderRadius: '999px', color: '#1467B8', fontWeight: 700, cursor: 'pointer' }}>
              How it works
            </button>
            <Link href="/rider/dashboard" style={{ padding: '8px 16px', background: 'linear-gradient(90deg,#1467B8,#179469)', color: '#fff', borderRadius: '999px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
              User Dashboard
            </Link>
            <Link href="/driver/login" style={{ padding: '8px 16px', background: '#111c29', color: '#2FC18E', border: '1.5px solid #2FC18E', borderRadius: '999px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
              Driver Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 12px', color: '#1467B8' }}>
            Your Car. A Verified Driver.
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#51647A', margin: 0 }}>
            നിങ്ങളുടെ സ്വന്തം വാഹനം സുരക്ഷിതമായി ഓടിക്കാൻ വിശ്വസ്തരായ പ്രൊഫഷണൽ ഡ്രൈവർമാരെ ബുക്ക് ചെയ്യുക.
          </p>
        </div>

        {/* Booking Form Card */}
        <section style={{ maxWidth: '560px', margin: '0 auto', background: '#fff', borderRadius: '24px', padding: '28px', border: '1px solid #DCE6E8', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 6px', color: '#1467B8', fontSize: '1.3rem' }}>ബുക്കിംഗ് റിക്വസ്റ്റ്</h2>
          <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '0.88rem' }}>യാത്രയുടെ വിവരങ്ങൾ കൃത്യമായി പൂരിപ്പിക്കുക</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>പൂർണ്ണ നാമം</label>
              <input required placeholder="ഉദാ: രാഹുൽ കൃഷ്ണൻ" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>മൊബൈൽ നമ്പർ (10 അക്കങ്ങൾ)</label>
              <input required type="tel" maxLength={10} placeholder="9876543210" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>പിക്കപ്പ് സ്ഥലം</label>
                <input required placeholder="ഉദാ: ഇടപ്പള്ളി" value={formData.pickup} onChange={e => setFormData({ ...formData, pickup: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>ഡ്രോപ്പ് സ്ഥലം</label>
                <input required placeholder="ഉദാ: കാക്കനാട്" value={formData.dropoff} onChange={e => setFormData({ ...formData, dropoff: e.target.value })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
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
              {loading ? 'റിക്വസ്റ്റ് അയക്കുന്നു...' : 'ഡ്രൈവറെ ബുക്ക് ചെയ്യുക'}
            </button>
          </form>

          {statusMsg.text && (
            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: statusMsg.color === '#22c55e' ? '#dcfce7' : '#fee2e2', border: `1px solid ${statusMsg.color}`, color: statusMsg.color === '#22c55e' ? '#15803d' : '#b91c1c', fontSize: '0.9rem', fontWeight: 600 }}>
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
              2. അപ്രൂവ് ചെയ്ത ഡ്രൈവർ നിങ്ങളുടെ റിക്വസ്റ്റ് സ്വീകരിക്കും.<br />
              3. ഡ്രൈവർ സ്ഥലത്തെത്തി നിങ്ങളുടെ കാർ ഓടിക്കുന്നു.
            </p>
            <button onClick={() => setModalOpen(false)} style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#1467B8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              ശരി
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
