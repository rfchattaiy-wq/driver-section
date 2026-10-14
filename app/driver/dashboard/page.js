'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function DriverDashboard() {
  const [rides, setRides] = useState([]);
  const [driverUser, setDriverUser] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. ലോഗിൻ ചെയ്ത ഡ്രൈവറെയും നിലവിലെ റൈഡുകളെയും കണ്ടെത്തുന്നു
  useEffect(() => {
    async function initDashboard() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setDriverUser(user);

      if (user) {
        // ഡ്രൈവറുടെ ഓൺലൈൻ സ്റ്റാറ്റസ് എടുക്കുന്നു
        const { data: profile } = await supabase
          .from('driver_profiles')
          .select('is_online')
          .eq('id', user.id)
          .single();

        if (profile) setIsOnline(profile.is_online || false);
      }

      await fetchRides();
      setLoading(false);
    }

    initDashboard();
  }, []);

  // ഡാറ്റാബേസിൽ നിന്ന് റൈഡുകൾ എടുക്കുന്നു
  const fetchRides = async () => {
    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRides(data);
    }
  };

  // 2. ഓൺലൈൻ / ഓഫ്ലൈൻ സ്റ്റാറ്റസ് മാറ്റുന്നു
  const toggleOnlineStatus = async () => {
    if (!driverUser) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    await supabase
      .from('driver_profiles')
      .update({ is_online: newStatus })
      .eq('id', driverUser.id);
  };

  // 3. റൈഡ് സ്വീകരിക്കുന്നു (Accept Ride)
  const handleAcceptRide = async (rideId) => {
    if (!driverUser) {
      alert('ദയവായി ആദ്യം ലോഗിൻ ചെയ്യുക.');
      return;
    }

    const { error } = await supabase
      .from('rides')
      .update({
        driver_id: driverUser.id,
        status: 'accepted'
      })
      .eq('id', rideId);

    if (error) {
      alert('റൈഡ് സ്വീകരിക്കുന്നതിൽ തടസ്സം: ' + error.message);
    } else {
      alert('നിങ്ങൾ ഈ ട്രിപ്പ് വിജയകരമായി സ്വീകരിച്ചു!');
      fetchRides();
    }
  };

  // 4. ട്രിപ്പ് പൂർത്തിയാക്കുന്നു (Complete Ride)
  const handleCompleteRide = async (rideId) => {
    const { error } = await supabase
      .from('rides')
      .update({ status: 'completed' })
      .eq('id', rideId);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('ട്രിപ്പ് വിജയകരമായി പൂർത്തിയായി.');
      fetchRides();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0D1A28', color: '#EAF3F4', fontFamily: 'sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#14263A', padding: '20px', borderRadius: '16px', border: '1px solid #24405A', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#3EC59B' }}>ഡ്രൈവർ പാർട്ണർ ഡാഷ്‌ബോർഡ്</h1>
            <p style={{ margin: '4px 0 0', color: '#A5B8C8', fontSize: '0.85rem' }}>
              {driverUser ? driverUser.email : 'ലോഗിൻ ചെയ്തിട്ടില്ല'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={toggleOnlineStatus}
              style={{
                padding: '10px 20px',
                borderRadius: '999px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                background: isOnline ? '#1F9E78' : '#dc2626',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }}></span>
              {isOnline ? 'Online (ട്രിപ്പുകൾ എടുക്കാം)' : 'Offline (വിശ്രമത്തിലാണ്)'}
            </button>
            <button onClick={fetchRides} style={{ padding: '10px 14px', background: '#24405A', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Trips List */}
        <h2 style={{ marginTop: '32px', marginBottom: '16px', fontSize: '1.25rem', color: '#4C9BE0' }}>
          വന്ന റൈഡ് റിക്വസ്റ്റുകൾ (Available Bookings)
        </h2>

        {loading ? (
          <p style={{ color: '#A5B8C8' }}>ലോഡ് ആകുന്നു...</p>
        ) : rides.length === 0 ? (
          <div style={{ background: '#14263A', padding: '32px', textAlign: 'center', borderRadius: '12px', border: '1px solid #24405A', color: '#A5B8C8' }}>
            ഇപ്പോൾ പുതിയ ബുക്കിംഗുകൾ ലഭ്യമല്ല.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {rides.map((ride) => (
              <div
                key={ride.id}
                style={{
                  background: '#14263A',
                  border: '1px solid #24405A',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: ride.status === 'accepted' ? '#1F9E78' : ride.status === 'completed' ? '#3b82f6' : '#d97706',
                      color: '#fff'
                    }}>
                      {ride.status.toUpperCase()}
                    </span>
                    <span style={{ color: '#A5B8C8', fontSize: '0.85rem' }}>{ride.trip_type || 'യാത്ര'}</span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: '#fff' }}>
                    യാത്രക്കാരൻ: {ride.rider_name || 'പേര് നൽകിയിട്ടില്ല'}
                  </h3>
                  <p style={{ margin: '2px 0', fontSize: '0.9rem', color: '#A5B8C8' }}>
                    📞 ഫോൺ: <strong style={{ color: '#fff' }}>{ride.rider_phone || 'ലഭ്യമല്ല'}</strong>
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '0.9rem', color: '#A5B8C8' }}>
                    📍 പിക്കപ്പ് സ്ഥലം: <strong style={{ color: '#fff' }}>{ride.pickup_location}</strong>
                  </p>
                  {ride.dropoff_location && (
                    <p style={{ margin: '2px 0', fontSize: '0.9rem', color: '#A5B8C8' }}>
                      🏁 ഡ്രോപ്പ് സ്ഥലം: {ride.dropoff_location}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {ride.status === 'requested' && (
                    <button
                      onClick={() => handleAcceptRide(ride.id)}
                      disabled={!isOnline}
                      style={{
                        padding: '12px 22px',
                        background: isOnline ? '#3EC59B' : '#475569',
                        color: isOnline ? '#08241c' : '#94a3b8',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isOnline ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {isOnline ? 'Accept Ride' : 'Online ആകുക'}
                    </button>
                  )}

                  {ride.status === 'accepted' && ride.driver_id === driverUser?.id && (
                    <button
                      onClick={() => handleCompleteRide(ride.id)}
                      style={{
                        padding: '10px 18px',
                        background: '#3b82f6',
                        color: '#fff',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
