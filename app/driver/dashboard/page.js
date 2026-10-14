'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function DriverDashboard() {
  const router = useRouter();
  const [driverUser, setDriverUser] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [availableRides, setAvailableRides] = useState([]);
  const [currentActiveRide, setCurrentActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyDriverAndLoadData() {
      setLoading(true);

      // 1. ലോഗിൻ ചെക്കിംഗ്
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('ഈ പേജിൽ കയറാൻ ആദ്യം ലോഗിൻ ചെയ്യണം!');
        router.push('/driver/login');
        return;
      }

      // 2. അപ്രൂവ് ചെയ്ത ഡ്രൈവർ ആണോ എന്ന് ഡാറ്റാബേസിൽ നോക്കുന്നു (Security Check)
      const { data: profile, error: profileErr } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileErr || !profile || profile.status !== 'approved') {
        alert('നിങ്ങൾക്ക് ഇതിലേക്ക് അനുമതിയില്ല! അഡ്മിൻ അപ്രൂവലിനായി കാത്തിരിക്കുക.');
        router.push('/driver/onboarding');
        return;
      }

      setDriverUser(user);
      setIsOnline(profile.is_online || false);

      await loadRides(user.id);
      setLoading(false);
    }

    verifyDriverAndLoadData();
  }, [router]);

  const loadRides = async (driverId) => {
    // ഡ്രൈവർക്ക് നിലവിൽ അക്സെപ്റ്റ് ചെയ്ത ട്രിപ്പ് ഉണ്ടോ എന്ന് നോക്കുന്നു
    const { data: myRide } = await supabase
      .from('rides')
      .select('*')
      .eq('driver_id', driverId)
      .eq('status', 'accepted')
      .maybeSingle();

    setCurrentActiveRide(myRide || null);

    // ആരും എടുക്കാത്ത പുതിയ ട്രിപ്പുകൾ മാത്രം ലിസ്റ്റ് ചെയ്യുന്നു (status = requested)
    const { data: openRides } = await supabase
      .from('rides')
      .select('*')
      .eq('status', 'requested')
      .order('created_at', { ascending: false });

    setAvailableRides(openRides || []);
  };

  // ഓൺലൈൻ / ഓഫ്ലൈൻ മാറ്റുന്നു
  const toggleOnline = async () => {
    if (!driverUser) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    await supabase.from('driver_profiles').update({ is_online: newStatus }).eq('id', driverUser.id);
  };

  // ട്രിപ്പ് അക്സെപ്റ്റ് ചെയ്യുന്നു (Concurrency Lock സഹിതം)
  const handleAcceptRide = async (rideId) => {
    if (currentActiveRide) {
      alert('നിങ്ങൾ ഇപ്പോൾ മറ്റൊരു യാത്രയിലാണ്! അത് തീർത്ത ശേഷം മാത്രമേ അടുത്തത് എടുക്കാൻ സാധിക്കൂ.');
      return;
    }

    // ഈ ട്രിപ്പ് ഇപ്പോഴും requested ആണെങ്കിൽ മാത്രമേ അക്സെപ്റ്റ് ആവൂ
    const { error } = await supabase
      .from('rides')
      .update({ driver_id: driverUser.id, status: 'accepted' })
      .eq('id', rideId)
      .eq('status', 'requested');

    if (error) {
      alert('ഈ ട്രിപ്പ് മറ്റാരോ എടുത്തു കഴിഞ്ഞു അല്ലെങ്കിൽ തടസ്സം നേരിട്ടു!');
    } else {
      alert('യാത്ര വിജയകരമായി ഏറ്റെടുത്തു!');
    }
    loadRides(driverUser.id);
  };

  // ട്രിപ്പ് പൂർത്തിയാക്കുന്നു
  const handleCompleteRide = async (rideId) => {
    const { error } = await supabase
      .from('rides')
      .update({ status: 'completed' })
      .eq('id', rideId);

    if (!error) {
      alert('യാത്ര വിജയകരമായി പൂർത്തിയായി.');
      setCurrentActiveRide(null);
      loadRides(driverUser.id);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1A28', color: '#EAF3F4', display: 'grid', placeItems: 'center', fontFamily: 'sans-serif' }}>
        <p>അനുമതി പരിശോധിക്കുന്നു...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1A28', color: '#EAF3F4', fontFamily: 'sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>

        {/* ഹെഡർ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#14263A', padding: '20px', borderRadius: '16px', border: '1px solid #24405A', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#3EC59B' }}>ഡ്രൈവർ പാർട്ണർ ഡാഷ്‌ബോർഡ്</h1>
            <p style={{ margin: '4px 0 0', color: '#A5B8C8', fontSize: '0.85rem' }}>വെരിഫൈ ചെയ്ത ഡ്രൈവർ: {driverUser.email}</p>
          </div>

          <button
            onClick={toggleOnline}
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              background: isOnline ? '#1F9E78' : '#dc2626',
              color: '#fff'
            }}
          >
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </button>
        </div>

        {/* 1. ഡ്രൈവറുടെ നിലവിലെ സജീവ യാത്ര (Active Trip) */}
        {currentActiveRide && (
          <div style={{ marginTop: '24px', background: '#08241c', border: '2px solid #3EC59B', borderRadius: '16px', padding: '20px' }}>
            <span style={{ background: '#3EC59B', color: '#08241c', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>
              നടന്നുകൊണ്ടിരിക്കുന്ന യാത്ര (ACTIVE)
            </span>
            <h2 style={{ color: '#fff', margin: '12px 0 6px' }}>യാത്രക്കാരൻ: {currentActiveRide.rider_name}</h2>
            <p style={{ margin: '4px 0', color: '#bbf7d0' }}>📞 ഫോൺ: {currentActiveRide.rider_phone}</p>
            <p style={{ margin: '4px 0', color: '#bbf7d0' }}>📍 പിക്കപ്പ്: {currentActiveRide.pickup_location}</p>
            <p style={{ margin: '4px 0', color: '#bbf7d0' }}>🏁 ഡ്രോപ്പ്: {currentActiveRide.dropoff_location}</p>

            <button
              onClick={() => handleCompleteRide(currentActiveRide.id)}
              style={{ marginTop: '16px', padding: '12px 24px', background: '#38bdf8', color: '#0f172a', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              യാത്ര പൂർത്തിയായി (Complete Ride)
            </button>
          </div>
        )}

        {/* 2. പുതിയ യാത്രകൾ (Available Rides) */}
        <h2 style={{ marginTop: '32px', color: '#4C9BE0', fontSize: '1.2rem' }}>ലഭ്യമായ പുതിയ ബുക്കിംഗുകൾ</h2>

        {currentActiveRide && (
          <p style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
            ⚠️ നിങ്ങൾ ഇപ്പോൾ ഒരു യാത്രയിലാണ്. അത് പൂർത്തിയാക്കിയ ശേഷം മാത്രമേ അടുത്തത് എടുക്കാൻ സാധിക്കൂ.
          </p>
        )}

        {availableRides.length === 0 ? (
          <div style={{ background: '#14263A', padding: '28px', textAlign: 'center', borderRadius: '12px', color: '#A5B8C8' }}>
            പുതിയ ബുക്കിംഗുകൾ ഒന്നും ലഭ്യമല്ല.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '14px', marginTop: '12px' }}>
            {availableRides.map(ride => (
              <div key={ride.id} style={{ background: '#14263A', border: '1px solid #24405A', borderRadius: '12px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#fff' }}>{ride.trip_type}</h4>
                  <p style={{ margin: '2px 0', color: '#A5B8C8' }}>യാത്രക്കാരൻ: {ride.rider_name} ({ride.rider_phone})</p>
                  <p style={{ margin: '2px 0', color: '#A5B8C8' }}>പിക്കപ്പ്: {ride.pickup_location}</p>
                </div>

                <button
                  onClick={() => handleAcceptRide(ride.id)}
                  disabled={!isOnline || !!currentActiveRide}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: (isOnline && !currentActiveRide) ? 'pointer' : 'not-allowed',
                    background: (isOnline && !currentActiveRide) ? '#3EC59B' : '#475569',
                    color: (isOnline && !currentActiveRide) ? '#08241c' : '#94a3b8'
                  }}
                >
                  Accept Ride
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
