'use client';
import { supabase } from '../../../lib/supabaseClient';

export default function DriverLoginPage() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/driver/dashboard`,
      },
    });

    if (error) {
      alert('Login Error: ' + error.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ background: '#1e293b', padding: '32px', borderRadius: '12px', textAlign: 'center', maxWidth: '360px', width: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}>
        <h2 style={{ marginBottom: '8px', color: '#38bdf8' }}>Easy Drive Partner</h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>ഡ്രൈവർമാർ ലോഗിൻ ചെയ്യാൻ താഴെ ക്ലിക്ക് ചെയ്യുക</p>
        
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
