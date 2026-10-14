'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function RiderDashboard() {
  const [user, setUser] = useState(null);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [phone, setPhone] = useState('');
  const [tripType, setTripType] = useState('Daily commute');
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getUserAndActiveRide() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: rides } = await supabase
          .from('rides')
          .select('*')
          .eq('rider_id', user.id)
          .in('status', ['requested', 'accepted'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (rides && rides.length > 0) setActiveRide(rides[0]);
      }
    }
    getUserAndActiveRide();
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/rider/dashboard` }
    });
  };

  const handleRequestRide = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.from('rides').insert({
      rider_id: user ? user.id : null,
      rider_name: user?.user_metadata?.full_name || 'Passenger',
      rider_phone: phone,
      pickup_location: pickup,
      dropoff_location: dropoff,
      trip_type: tripType,
      status: 'requested'
    }).select().single();

    if (error) {
      alert('Error requesting ride: ' + error.message);
    } else {
      setActiveRide(data);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAF9', color: '#16283A', padding: '32px 20px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <h2 style={{ color: '#1467B8', margin: '0 0 16px' }}>Passenger Ride Terminal</h2>

        {!user ? (
          <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', border: '1px solid #DCE6E8', textAlign: 'center' }}>
            <p style={{ color: '#51647A', marginBottom: '20px' }}>Sign in to track your assigned driver and book private chauffeurs.</p>
            <button onClick={handleGoogleLogin} style={{ padding: '12px 24px', background: '#1467B8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Sign in with Google
            </button>
          </div>
        ) : activeRide ? (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1.5px solid #2FC18E' }}>
            <span style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', background: activeRide.status === 'accepted' ? '#22c55e' : '#eab308', color: '#fff', fontWeight: 700 }}>
              {activeRide.status === 'accepted' ? 'DRIVER EN ROUTE' : 'SEARCHING FOR DRIVER'}
            </span>
            <h3 style={{ margin: '14px 0 6px', color: '#1467B8' }}>Trip: {activeRide.trip_type}</h3>
            <p style={{ margin: '4px 0', color: '#51647A' }}>Pickup: <strong>{activeRide.pickup_location}</strong></p>
            <p style={{ margin: '4px 0', color: '#51647A' }}>Drop-off: <strong>{activeRide.dropoff_location}</strong></p>
            <button onClick={() => setActiveRide(null)} style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Dismiss / New Ride
            </button>
          </div>
        ) : (
          <form onSubmit={handleRequestRide} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #DCE6E8', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Pickup Location</label>
              <input required placeholder="Metro station / Landmark" value={pickup} onChange={e => setPickup(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #DCE6E8' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Drop-off Location</label>
              <input required placeholder="Destination address" value={dropoff} onChange={e => setDropoff(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #DCE6E8' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Phone Number</label>
              <input required type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #DCE6E8' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Trip Category</label>
              <select value={tripType} onChange={e => setTripType(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #DCE6E8' }}>
                <option>Daily commute</option>
                <option>Night travel</option>
                <option>Outstation trip</option>
              </select>
            </div>

            <button type="submit" disabled={loading} style={{ padding: '12px', background: '#1467B8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}>
              {loading ? 'Submitting...' : 'Confirm Chauffeur Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
