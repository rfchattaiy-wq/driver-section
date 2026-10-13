'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // അഡ്മിൻ പിൻ നമ്പർ
  const ADMIN_PIN = '1234';

  const checkPin = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthorized(true);
      fetchBookings();
    } else {
      alert('Invalid PIN!');
    }
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
      alert('Failed to update status');
    } else {
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    }
  };

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0D1A28', fontFamily: 'sans-serif', color: '#fff', padding: '20px' }}>
        <form onSubmit={checkPin} style={{ background: '#14263A', padding: '30px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '320px', border: '1px solid #24405A' }}>
          <h2 style={{ margin: 0, textAlign: 'center', color: '#4C9BE0' }}>Admin Login</h2>
          <input
            type="password"
            placeholder="Enter PIN (Default: 1234)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #24405A', background: '#0D1A28', color: '#fff', fontSize: '1rem', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '12px', background: '#1769B5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
            Unlock Dashboard
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
            <p style={{ margin: '4px 0 0', color: '#51647A' }}>Manage customer ride requests</p>
          </div>
          <button onClick={fetchBookings} style={{ padding: '10px 18px', background: '#3EC59B', color: '#0b2a21', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Refreshing...' : 'Refresh Bookings'}
          </button>
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
