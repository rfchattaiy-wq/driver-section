'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function RiderDashboard() {
  const [user, setUser] = useState(null);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [phone, setPhone] = useState('');
  const [tripType, setTripType] = useState('Daily commute');
  const [activeRide, setActiveRide] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // നിലവിലെ റൈഡും ഡ്രൈവറുടെ വിവരങ്ങളും കണ്ടെത്തുന്നു
  const fetchCurrentTrip = useCallback(async (userId) => {
    if (!userId) return;

    const { data: rides } = await supabase
      .from('rides')
      .select('*')
      .eq('rider_id', userId)
      .in('status', ['requested', 'accepted'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (rides && rides.length > 0) {
      const currentTrip = rides[0];
      setActiveRide(currentTrip);

      // ഡ്രൈവർ അക്സെപ്റ്റ് ചെയ്തിട്ടുണ്ടെങ്കിൽ ഡ്രൈവറുടെ വിവരങ്ങൾ എടുക്കുന്നു
      if (currentTrip.status === 'accepted' && currentTrip.driver_id) {
        const { data: driver } = await supabase
          .from('driver_profiles')
          .select('full_name, phone, vehicle_details')
          .eq('id', currentTrip.driver_id)
          .single();

        if (driver) setDriverInfo(driver);
      } else {
        setDriverInfo(null);
      }
    } else {
      setActiveRide(null);
      setDriverInfo(null);
    }
  }, []);

  useEffect(() => {
    async function initUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchCurrentTrip(user.id);
      }
    }
    initUser();
  }, [fetchCurrentTrip]);

  // തത്സമയ അപ്ഡേറ്റിനായി 4 സെക്കൻഡ് കൂടുമ്പോൾ ഡാറ്റ പരിശോധിക്കുന്നു (Polling)
  useEffect(() => {
    if (!user || !activeRide || activeRide.status === 'completed') return;

    const interval = setInterval(() => {
      fetchCurrentTrip(user.id);
    }, 4000);

    return () => clearInterval(interval);
  }, [user, activeRide, fetchCurrentTrip]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/rider/dashboard` }
    });
  };

  const handleRequestRide = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // വാലിഡേഷൻ
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      setErrorMsg('സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.');
      return;
    }

    if (pickup.trim().length < 6 || dropoff.trim().length < 6) {
      setErrorMsg('പിക്കപ്പ്, ഡ്രോപ്പ് സ്ഥലങ്ങൾ കൃത്യമായി വ്യക്തമാക്കുക (കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ).');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.from('rides').insert({
      rider_id: user ? user.id : null,
      rider_name: user?.user_metadata?.full_name || 'Passenger',
      rider_phone: phone.trim(),
      pickup_location: pickup.trim(),
      dropoff_location: dropoff.trim(),
      trip_type: tripType,
      status: 'requested'
    }).select().single();

    if (error) {
      setErrorMsg('റൈഡ് ബുക്ക് ചെയ്യാൻ സാധിച്ചില്ല: ' + error.message);
    } else {
      setActiveRide(data);
    }
    setLoading(false);
  };

  // യാത്ര റദ്ദാക്കൽ (Cancel Ride)
  const handleCancelRide = async () => {
    if (!activeRide) return;
    const confirmCancel = window.confirm('ഈ ബുക്കിംഗ് റദ്ദാക്കണമെന്ന് ഉറപ്പാണോ?');
    if (!confirmCancel) return;

    const { error } = await supabase
      .from('rides')
      .update({ status: 'canceled' })
      .eq('id', activeRide.id);

    if (error) {
      alert('റദ്ദാക്കുന്നതിൽ തടസ്സം: ' + error.message);
    } else {
      alert('ബുക്കിംഗ് റദ്ദാക്കി.');
      setActiveRide(null);
      setDriverInfo(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAF9', color: '#16283A', fontFamily: 'sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        
        {/* Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#1467B8', fontWeight: 800, fontSize: '1.2rem' }}>
            &larr; Easy Drive Home
          </Link>
          {user && (
            <span style={{ fontSize: '0.85rem', color: '#51647A' }}>
              {user.user_metadata?.full_name || user.email}
            </span>
          )}
        </div>

        {/* ഗൂഗിൾ ലോഗിൻ ചെയ്യാത്ത അവസ്ഥ */}
        {!user ? (
          <div style={{ background: '#fff', padding: '32px 24px', borderRadius: '20px', border: '1px solid #DCE6E8', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ color: '#1467B8', marginTop: 0 }}>യാത്രക്കാരൻ ലോഗിൻ</h2>
            <p style={{ color: '#51647A', fontSize: '0.95rem', marginBottom: '24px' }}>
              നിങ്ങളുടെ കാറിനായി ഡ്രൈവറെ വിളിക്കാനും തത്സമയ സ്റ്റാറ്റസ് കാണാനും ഗൂഗിൾ ഉപയോഗിച്ച് പ്രവേശിക്കുക.
            </p>
            <button onClick={handleGoogleLogin} style={{ padding: '12px 24px', background: '#1467B8', color: '#fff', border: 'none', borderRadius: '999px', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}>
              Continue with Google
            </button>
          </div>
        ) : activeRide ? (
          /* സജീവ യാത്രയുടെ തത്സമയ സ്റ്റാറ്റസ് കാർഡ് (Active Ride Card) */
          <div style={{ background: '#fff', borderRadius: '24px', border: activeRide.status === 'accepted' ? '2px solid #2FC18E' : '2px solid #f59e0b', padding: '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
            
            {/* Status Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 900,
                color: '#fff',
                background: activeRide.status === 'accepted' ? '#179469' : '#d97706'
              }}>
                {activeRide.status === 'accepted' ? '🟢 ഡ്രൈവർ വരുന്നു (DRIVER EN-ROUTE)' : '🟡 ഡ്രൈവർക്കായി തിരയുന്നു...'}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#51647A' }}>{activeRide.trip_type}</span>
            </div>

            {/* ഡ്രൈവർ വിവരങ്ങൾ */}
            {activeRide.status === 'accepted' && driverInfo ? (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 6px', color: '#166534', fontSize: '1.15rem' }}>
                  🚕 ഡ്രൈവർ വിവരങ്ങൾ
                </h3>
                <p style={{ margin: '2px 0', fontSize: '0.95rem' }}>പേര്: <strong>{driverInfo.full_name}</strong></p>
                <p style={{ margin: '2px 0', fontSize: '0.95rem' }}>ഫോൺ: <strong>{driverInfo.phone}</strong></p>
                <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#51647A' }}>പരിചയം: {driverInfo.vehicle_details}</p>
                <a href={`tel:${driverInfo.phone}`} style={{ display: 'inline-block', marginTop: '10px', padding: '8px 16px', background: '#179469', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem' }}>
                  📞 ഡ്രൈവറെ വിളിക്കുക
                </a>
              </div>
            ) : (
              <div style={{ padding: '16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '14px', marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#92400E', fontSize: '0.9rem', fontWeight: 700 }}>
                  അടുത്തുള്ള വെരിഫൈഡ് ഡ്രൈവർമാർക്ക് നോട്ടിഫിക്കേഷൻ അയച്ചിട്ടുണ്ട്. ഒരാൾ അക്സെപ്റ്റ് ചെയ്യുമ്പോൾ വിവരങ്ങൾ ഇവിടെ കാണാം.
                </p>
              </div>
            )}

            {/* റൂട്ട് വിവരങ്ങൾ */}
            <div style={{ borderTop: '1px solid #DCE6E8', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#51647A' }}>പിക്കപ്പ് ലൊക്കേഷൻ</span>
                <p style={{ margin: 0, fontWeight: 700 }}>{activeRide.pickup_location}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#51647A' }}>ഡ്രോപ്പ് ലൊക്കേഷൻ</span>
                <p style={{ margin: 0, fontWeight: 700 }}>{activeRide.dropoff_location}</p>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleCancelRide}
              style={{ marginTop: '24px', width: '100%', padding: '12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
            >
              ഈ യാത്ര റദ്ദാക്കുക (Cancel Ride)
            </button>
          </div>
        ) : (
          /* പുതിയ റൈഡ് ബുക്ക് ചെയ്യാനുള്ള ഫോം (Ride Booking Form) */
          <form onSubmit={handleRequestRide} style={{ background: '#fff', padding: '28px', borderRadius: '24px', border: '1px solid #DCE6E8', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ color: '#1467B8', margin: '0 0 4px' }}>പുതിയ യാത്ര ബുക്ക് ചെയ്യുക</h2>
            <p style={{ color: '#51647A', fontSize: '0.9rem', margin: '0 0 12px' }}>യാത്രയുടെ വിവരങ്ങൾ കൃത്യമായി രേഖപ്പെടുത്തുക</p>

            {errorMsg && (
              <div style={{ padding: '10px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', fontSize: '0.85rem' }}>
                {errorMsg}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>പിക്കപ്പ് സ്ഥലം (Pickup)</label>
              <input required placeholder="ഉദാ: ഇടപ്പള്ളി മെട്രോ സ്റ്റേഷൻ" value={pickup} onChange={e => setPickup(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #DCE6E8', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>ഡ്രോപ്പ് സ്ഥലം (Destination)</label>
              <input required placeholder="ഉദാ: ഇൻഫോപാർക്ക് ഫേസ് 1, കാക്കനാട്" value={dropoff} onChange={e => setDropoff(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #DCE6E8', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>മൊബൈൽ നമ്പർ</label>
              <input required type="tel" maxLength={10} placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #DCE6E8', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>യാത്രാ വിഭാഗം</label>
              <select value={tripType} onChange={e => setTripType(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #DCE6E8', boxSizing: 'border-box' }}>
                <option>Daily commute</option>
                <option>Night travel</option>
                <option>Outstation trip</option>
              </select>
            </div>

            <button type="submit" disabled={loading} style={{ padding: '14px', background: 'linear-gradient(90deg,#1467B8,#179469)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', marginTop: '8px', fontSize: '1rem' }}>
              {loading ? 'ഡ്രൈവറെ റിക്വസ്റ്റ് ചെയ്യുന്നു...' : 'ഡ്രൈവറെ റിക്വസ്റ്റ് ചെയ്യുക'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
