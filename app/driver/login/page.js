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
            padding: '12px',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3

