'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function RiderDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // ബുക്കിംഗ് ഫോം വിവരങ്ങൾ
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [tripType, setTripType] = useState('Daily commute');
  const [time, setTime] = useState('');

  const currentDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  useEffect(() => {
    const n = localStorage.getItem('easydrive_rider_name') || 'Customer';
    const p = localStorage.getItem('easydrive_rider_phone') || '';
    if (!p) {
      router.push('/rider/login');
      return;
    }
    setUserName(n);
    setUserPhone(p);
    fetchMyRides(p);
  }, [router]);

  // ഈ യൂസറുടെ ബുക്കിംഗുകൾ മാത്രം കൊണ്ടുവരുന്നു
  const fetchMyRides = async (phone) => {
    const { data } = await supabase
      .from('rides')
      .select('*')
      .eq('rider_phone', phone)
      .order('created_at', { ascending: false });

    if (data) setRides(data);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');

    const { data, error } = await supabase.from('rides').insert({
      rider_name: userName,
      rider_phone: userPhone,
      trip_type: tripType,
      scheduled_time: time,
      pickup_location: pickup,
      dropoff_location: dropoff,
      status: 'pending',
    }).select();

    if (error) {
      setStatusMsg('ബുക്കിംഗ് പരാജയപ്പെട്ടു: ' + error.message);
    } else {
      setStatusMsg('✅ റൈഡ് വിജയകരമായി ബുക്ക് ചെയ്തു! അഡ്മിന് തനിയെ വിവരം ലഭിക്കുന്നതാണ്.');
      setPickup('');
      setDropoff('');
      fetchMyRides(userPhone);

      // ഓട്ടോമാറ്റിക് ബാക്ക്‌എൻഡ് അഡ്മിൻ അലേർട്ട് ട്രിഗർ (WhatsApp Webhook / Notification)
      try {
        fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userName,
            phone: userPhone,
            pickup,
            dropoff,
            time,
            tripType
          })
        });
      } catch (err) {
        console.log('Background notify error:', err);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', fontFamily: 'sans-serif' }}>
      
      {/* Top Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#1467B8' }}>easy<span style={{ color: '#179469' }}>drive</span> Rider</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748B' }}>👤 {userName} ({userPhone})</span>
          <button onClick={() => { localStorage.clear(); router.push('/rider/login'); }} style={{ padding: '6px 12px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
            Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '800px', margin: '32px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* New Booking Section */}
        <section style={{ background: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.3rem', color: '#1467B8' }}>പുതിയ യാത്ര ബുക്ക് ചെയ്യുക</h2>
          <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#64748B' }}>സ്ഥലവും സമയവും തിരഞ്ഞെടുക്കുക</p>

          <form onSubmit={handleBooking} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>പിക്കപ്പ് സ്ഥലം</label>
              <input required placeholder="ഉദാ: Aluva" value={pickup} onChange={e => setPickup(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>ഡ്രോപ്പ് സ്ഥലം</label>
              <input required placeholder="ഉദാ: Kakkanad" value={dropoff} onChange={e => setDropoff(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>വിഭാഗം</label>
              <select value={tripType} onChange={e => setTripType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box', background: '#fff' }}>
                <option>Daily commute</option>
                <option>Night travel</option>
                <option>Outstation trip</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>സമയം</label>
              <input required type="datetime-local" min={currentDateTime} value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" disabled={loading} style={{ gridColumn: '1 / -1', padding: '13px', background: 'linear-gradient(90deg, #1467B8, #179469)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', marginTop: '6px' }}>
              {loading ? 'ബുക്കിംഗ് രേഖപ്പെടുത്തുന്നു...' : 'ഡ്രൈവറെ റിക്വസ്റ്റ് ചെയ്യുക'}
            </button>
          </form>

          {statusMsg && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#F0FDF4', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
              {statusMsg}
            </div>
          )}
        </section>

        {/* Live Status Tracking Section */}
        <section style={{ background: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.25rem', color: '#0F172A' }}>നിങ്ങളുടെ യാത്രകൾ & തത്സമയ സ്റ്റാറ്റസ്</h2>
          
          {rides.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>ഇതുവരെ യാത്രകളൊന്നും ബുക്ക് ചെയ്തിട്ടില്ല.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rides.map(r => (
                <div key={r.id} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1E293B' }}>
                      📍 {r.pickup_location} ➔ 🏁 {r.dropoff_location}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                      🕒 {new Date(r.scheduled_time).toLocaleString('en-IN')} | {r.trip_type}
                    </div>
                  </div>

                  {/* ലൈവ് സ്റ്റാറ്റസ് ബാഡ്ജ് */}
                  <div>
                    {r.status === 'pending' || r.status === 'requested' ? (
                      <span style={{ padding: '6px 12px', background: '#FEF3C7', color: '#B45309', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800 }}>
                        ⏳ Pending Driver Allocation
                      </span>
                    ) : r.status === 'accepted' ? (
                      <span style={{ padding: '6px 12px', background: '#DCFCE7', color: '#15803D', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800 }}>
                        ✅ Driver Confirmed
                      </span>
                    ) : (
                      <span style={{ padding: '6px 12px', background: '#F1F5F9', color: '#475569', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800 }}>
                        🏁 {r.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
