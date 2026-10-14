'use client';
import { supabase } from '../../../lib/supabaseClient';

export default function DriverLoginPage() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/driver/onboarding`,
      },
    });

    if (error) {
      alert('Login Error: ' + error.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ background: '#1e293b', padding: '32px', borderRadius: '16px', textAlign: 'center', maxWidth: '380px', width: '100%', border: '1px solid #334155' }}>
        <h2 style={{ marginBottom: '8px', color: '#2FC18E' }}>Driver Partner Portal</h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Sign in to receive trip requests and view earnings.</p>
        
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
            fontSize: '15px',
            cursor: 'pointer'
          }}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
