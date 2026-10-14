'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function DriverDashboard() {
  const [rides, setRides] = useState([]);
  const [online, setOnline] = useState(false);
  const [driverUser, setDriverUser] = useState(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setDriverUser(user);

      // Fetch pending ride requests
      const { data: requestedRides } = await supabase
        .from('rides')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestedRides) setRides(requestedRides);
    }
    loadData();
  }, []);

  const handleAcceptRide = async (rideId) => {
    if (!driverUser) return;
    const { error } = await supabase
      .from('rides')
      .update({ driver_id: driverUser.id, status: 'accepted' })
      .eq('id', rideId);

    if (error) {
      alert('Error accepting ride: ' + error.message);
    } else {
      setRides(rides.map(r => r.id === rideId ? { ...r, status: 'accepted' } : r));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#2FC18E', margin: 0 }}>Driver Partner Operations</h2>
          <button onClick={() => setOnline(!online)} style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', background: online ? '#22c55e' : '#64748b', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {online ? 'Status: Active (Online)' : 'Status: Offline'}
          </button>
        </div>

        <h3 style={{ color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>Active Trip Stream</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
          {rides.length === 0 ? (
            <p style={{ color: '#64748b' }}>No trip requests available right now.</p>
          ) : (
            rides.map(ride => (
              <div key={ride.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', color: '#38bdf8' }}>{ride.trip_type}</h4>
                  <p style={{ margin: '2px 0', fontSize: '0.9rem' }}>Passenger: <strong>{ride.rider_name || 'Anonymous User'}</strong> ({ride.rider_phone || 'No phone'})</p>
                  <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#94a3b8' }}>Pickup: {ride.pickup_location}</p>
                  <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: ride.status === 'accepted' ? '#166534' : '#854d0e', color: '#fff' }}>
                    {ride.status.toUpperCase()}
                  </span>
                </div>

                {ride.status === 'requested' && (
                  <button onClick={() => handleAcceptRide(ride.id)} style={{ padding: '10px 20px', background: '#22c55e', border: 'none', borderRadius: '8px', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}>
                    Accept Trip
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
