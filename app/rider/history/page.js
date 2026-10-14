'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function RiderTripHistory() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('rides')
          .select('*')
          .eq('rider_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setTrips(data);
        }
      }
      setLoading(false);
    }

    loadHistory();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAF9', color: '#16283A', fontFamily: 'sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        
        {/* ഹെഡർ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Link href="/rider/dashboard" style={{ textDecoration: 'none', color: '#1467B8', fontWeight: 800 }}>
            &larr; തിരികെ ഡാഷ്‌ബോർഡിലേക്ക്
          </Link>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1467B8' }}>യാത്രാ ചരിത്രം (Trip History)</h2>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#51647A' }}>വിവരങ്ങൾ ശേഖരിക്കുന്നു...</p>
        ) : trips.length === 0 ? (
          <div style={{ background: '#fff', padding: '36px', borderRadius: '16px', border: '1px solid #DCE6E8', textAlign: 'center', color: '#51647A' }}>
            മുൻകാല യാത്രകളുടെ വിവരങ്ങൾ ഒന്നും ലഭ്യമല്ല.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {trips.map(trip => (
              <div key={trip.id} style={{ background: '#fff', border: '1px solid #DCE6E8', borderRadius: '16px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#51647A' }}>
                    {new Date(trip.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    color: '#fff',
                    background: trip.status === 'completed' ? '#179469' : trip.status === 'canceled' ? '#dc2626' : '#d97706'
                  }}>
                    {trip.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '0.92rem', lineHeight: '1.5' }}>
                  <p style={{ margin: '2px 0' }}>📍 <strong>പിക്കപ്പ്:</strong> {trip.pickup_location}</p>
                  <p style={{ margin: '2px 0' }}>🏁 <strong>ഡ്രോപ്പ്:</strong> {trip.dropoff_location || 'ലഭ്യമല്ല'}</p>
                  <p style={{ margin: '2px 0', color: '#51647A', fontSize: '0.85rem' }}>യാത്രാ വിഭാഗം: {trip.trip_type}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
