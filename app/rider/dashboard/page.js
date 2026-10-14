'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function RiderDashboard() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRequestRide = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('rides')
      .insert({
        rider_id: user ? user.id : null,
        pickup_location: pickup,
        dropoff_location: dropoff,
        status: 'requested',
      });

    if (error) {
      alert('Error requesting ride: ' + error.message);
    } else {
      setBookingStatus('Looking for nearby drivers...');
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', padding: '24px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <h2 style={{ color: '#38bdf8', marginBottom: '8px' }}>Book Your Ride</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>Enter your trip destinations</p>

        {bookingStatus ? (
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #38bdf8', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#38bdf8' }}>Status: {bookingStatus}</h3>
            <p style={{ color: '#cbd5e1' }}>Pickup: <strong>{pickup}</strong></p>
            <p style={{ color: '#cbd5e1' }}>Destination: <strong>{dropoff}</strong></p>
            <button onClick={() => setBookingStatus(null)} style={{ marginTop: '16px', padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Cancel Ride
            </button>
          </div>
        ) : (
          <form onSubmit={handleRequestRide} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #334155' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Pickup Location</label>
              <input required type="text" placeholder="e.g. MG Road Metro Station" value={pickup} onChange={(e) => setPickup(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Drop-off Destination</label>
              <input required type="text" placeholder="e.g. Infopark Phase 1" value={dropoff} onChange={(e) => setDropoff(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }} />
            </div>

            <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#22c55e', color: '#0f172a', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '8px' }}>
              {loading ? 'Submitting...' : 'Request Ride Now'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
