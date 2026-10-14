'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminControlHub() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // ലളിതമായ അഡ്മിൻ സെക്യൂരിറ്റി പാസ്‌വേഡ് (നിങ്ങൾക്ക് മാറ്റാം)
  const ADMIN_SECRET = 'admin123';

  const loadData = async () => {
    // 1. എല്ലാ റൈഡുകളും എടുക്കുന്നു
    const { data: rideData } = await supabase
      .from('rides')
      .select('*')
      .order('created_at', { ascending: false });

    // 2. എല്ലാ ഡ്രൈവർമാരെയും എടുക്കുന്നു
    const { data: driverData } = await supabase
      .from('driver_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    setRides(rideData || []);
    setDrivers(driverData || []);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPass === ADMIN_SECRET) {
      setIsAdminAuthenticated(true);
      loadData();
    } else {
      alert('തെറ്റായ അഡ്മിൻ പാസ്‌വേഡ്!');
    }
  };

  const updateDriverStatus = async (driverId, newStatus) => {
    await supabase.from('driver_profiles').update({ status: newStatus }).eq('id', driverId);
    loadData();
  };

  if (!isAdminAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1A28', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleAdminLogin} style={{ background: '#14263A', padding: '32px', borderRadius: '16px', border: '1px solid #24405A', width: '320px', textAlign: 'center' }}>
          <h2 style={{ color: '#4C9BE0', marginTop: 0 }}>അഡ്മിൻ ലോഗിൻ</h2>
          <input
            type="password"
            placeholder="അഡ്മിൻ പാസ്‌വേഡ്"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #24405A', background: '#0D1A28', color: '#fff', marginBottom: '16px', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#4C9BE0', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            തുറക്കുക
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1A28', color: '#EAF3F4', fontFamily: 'sans-serif', padding: '24px 20px' }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        
        <h1 style={{ color: '#4C9BE0', margin: 0 }}>Easy Drive Admin Operations Hub</h1>
        <p style={{ color: '#A5B8C8' }}>ട്രിപ്പ് നിരീക്ഷണവും ഡ്രൈവർ അപ്രൂവലും</p>

        {/* ഭാഗം 1: ട്രിപ്പുകളുടെ സ്റ്റാറ്റസ് (ആര് എടുത്തു എന്ന് കാണാം) */}
        <h2 style={{ marginTop: '28px', color: '#3EC59B' }}>എല്ലാ ട്രിപ്പുകളും & ഡ്രൈവർ സ്റ്റാറ്റസും</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {rides.map(ride => {
            const assignedDriver = drivers.find(d => d.id === ride.driver_id);
            return (
              <div key={ride.id} style={{ background: '#14263A', border: '1px solid #24405A', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#fff' }}>യാത്രക്കാരൻ: {ride.rider_name} ({ride.rider_phone})</h4>
                  <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#A5B8C8' }}>പിക്കപ്പ്: {ride.pickup_location}</p>
                  <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#3EC59B' }}>
                    🚕 നിയോഗിക്കപ്പെട്ട ഡ്രൈവർ: <strong>{assignedDriver ? `${assignedDriver.full_name} (${assignedDriver.phone})` : 'ആരും എടുത്തിട്ടില്ല (Waiting)'}</strong>
                  </p>
                </div>
                <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', background: ride.status === 'completed' ? '#3b82f6' : ride.status === 'accepted' ? '#1F9E78' : '#eab308', color: '#fff' }}>
                  {ride.status.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* ഭാഗം 2: ഡ്രൈവർമാരെ വെരിഫൈ ചെയ്യാനുള്ള ലിസ്റ്റ് */}
        <h2 style={{ marginTop: '40px', color: '#4C9BE0' }}>ഡ്രൈവർ ലൈസൻസ് അപ്രൂവൽ</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {drivers.map(driver => (
            <div key={driver.id} style={{ background: '#14263A', border: '1px solid #24405A', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px', color: '#fff' }}>{driver.full_name} ({driver.phone})</h4>
                <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#A5B8C8' }}>ലൈസൻസ്: {driver.license_number}</p>
                {driver.license_url && (
                  <a href={driver.license_url} target="_blank" rel="noreferrer" style={{ color: '#4C9BE0', fontSize: '0.85rem' }}>ലൈസൻസ് ഫോട്ടോ കാണുക &rarr;</a>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: driver.status === 'approved' ? '#1F9E78' : '#dc2626', color: '#fff' }}>
                  {driver.status.toUpperCase()}
                </span>
                {driver.status !== 'approved' && (
                  <button onClick={() => updateDriverStatus(driver.id, 'approved')} style={{ padding: '6px 12px', background: '#3EC59B', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    അപ്രൂവ് ചെയ്യുക
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
