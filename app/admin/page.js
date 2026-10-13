'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchBookings();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchBookings();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setBookings([]);
  };

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      alert('Error fetching bookings: ' + error.message);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Failed to update status: ' + error.message);
    } else {
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    }
  };

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0D1A28', fontFamily: 'sans-serif', color: '#fff', padding: '20px' }}>
        <form onSubmit={handleLogin} style={{ background: '#14263A', padding: '30px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '340px', border: '1px solid #24405A' }}>
          <h2 style={{ margin: 0, textAlign: 'center', color: '#4C9BE0' }}>Secure Admin Access</h2>
          {authError && <div style={{ color: '#ef4444', fontSize: '0.9rem', background: '#451a1a', padding: '8px', borderRadius: '6px' }}>{authError}</div>}
          
          <input
            type="email"
            placeholder="Admin Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #24405A', background: '#0D1A28', color: '#fff', fontSize: '1rem', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #24405A', background: '#0D1A28', color: '#fff', fontSize: '1rem', outline: 'none' }}
          />
          <button type="submit" disabled={authLoading} style={{ padding: '12px', background: '#1769B5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
            {authLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAF9', fontFamily: 'sans-serif', padding: '30px 20px', color: '#16283A' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1769B5' }}>Easy Drive Admin</h1>
            <p style={{ margin: '4px 0 0', color: '#51647A' }}>Logged in as: {session.user.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchBookings} style={{ padding: '10px 16px', background: '#3EC59B', color: '#0b2a21', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={handleLogout} style={{ padding: '10px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px solid #DCE6E8' }}>
            <p style={{ margin: 0, color: '#51647A' }}>No bookings found yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {bookings.map((b) => (
              <div key={b.id} style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #DCE6E8', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#16283A' }}>{b.customer_name}</h3>
                  <p style={{ margin: '0 0 4px', color: '#51647A', fontSize: '0.95rem' }}>📞 Phone: <strong>{b.customer_phone}</strong></p>
                  <p style={{ margin: '0 0 4px', color: '#51647A', fontSize: '0.95rem' }}>📍 Pickup: <strong>{b.pickup_location}</strong></p>
                  <p style={{ margin: '0 0 4px', color: '#51647A', fontSize: '0.95rem' }}>🕒 Time: <strong>{b.pickup_date || 'N/A'}</strong> ({b.transmission_type || 'Commute'})</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={`tel:${b.customer_phone}`}
                      style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#1769B5', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}
                    >
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${b.customer_phone?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#25D366', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}
                    >
                      WhatsApp
                    </a>
                  </div>

                  <select
                    value={b.status || 'Pending'}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #DCE6E8', background: b.status === 'Completed' ? '#dcfce7' : b.status === 'Confirmed' ? '#e0f2fe' : '#fef9c3', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
