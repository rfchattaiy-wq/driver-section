'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function RiderLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // ഗൂഗിൾ ലോഗിൻ
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/rider/dashboard`,
      },
    });
    if (error) setMsg(error.message);
  };

  // ഫോൺ & ഇമെയിൽ ലോഗിൻ / സിമ്പിൾ സൈൻ-ഇൻ
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setMsg('സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.');
      return;
    }

    setLoading(true);
    setMsg('');

    // യൂസറുടെ വിവരങ്ങൾ ലോക്കൽ സെഷനിലേക്ക് സേവ് ചെയ്യുന്നു
    localStorage.setItem('easydrive_rider_name', name.trim());
    localStorage.setItem('easydrive_rider_phone', phone.trim());

    // പാസ്‌വേഡ് ഇല്ലാതെ ഒറ്റ ക്ലിക്കിൽ ഡാഷ്‌ബോർഡിലേക്ക്
    router.push('/rider/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '400px', width: '100%', background: '#fff', padding: '32px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        
        <h2 style={{ margin: '0 0 6px', color: '#1467B8', fontSize: '1.5rem', fontWeight: 900 }}>User Login</h2>
        <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: '0.88rem' }}>യാത്രകൾ ബുക്ക് ചെയ്യാൻ ലോഗിൻ ചെയ്യുക</p>

        {msg && (
          <div style={{ padding: '10px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {msg}
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          style={{ width: '100%', padding: '12px', background: '#fff', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontWeight: 700, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '18px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"/><path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/></svg>
          Google വഴി ലോഗിൻ ചെയ്യുക
        </button>

        <div style={{ textAlign: 'center', margin: '16px 0', color: '#94A3B8', fontSize: '0.85rem' }}>അല്ലെങ്കിൽ ഫോൺ നമ്പർ ഉപയോഗിച്ച്</div>

        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>പേര്</label>
            <input required placeholder="Akash Prakash" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>മൊബൈൽ നമ്പർ (10 അക്കങ്ങൾ)</label>
            <input required type="tel" maxLength={10} placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '13px', background: '#1467B8', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', marginTop: '6px' }}>
            ഡാഷ്‌ബോർഡിലേക്ക് പ്രവേശിക്കുക
          </button>
        </form>
      </div>
    </div>
  );
}
