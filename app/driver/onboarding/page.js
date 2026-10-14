'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function DriverOnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', phone: '', licenseNumber: '', vehicleDetails: '' });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkExistingProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/driver/login');
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.status === 'approved') {
          router.push('/driver/dashboard');
        } else {
          setStatus(profile.status);
        }
      }
    }
    checkExistingProfile();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    let licenseUrl = '';
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('licenses').upload(fileName, file);

      if (uploadError) {
        alert('File upload failed: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage.from('licenses').getPublicUrl(fileName);
      licenseUrl = data.publicUrl;
    }

    const { error } = await supabase.from('driver_profiles').upsert({
      id: user.id,
      full_name: formData.fullName,
      phone: formData.phone,
      license_number: formData.licenseNumber,
      vehicle_details: formData.vehicleDetails,
      license_url: licenseUrl,
      status: 'pending',
    });

    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      setStatus('pending');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', padding: '32px 20px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ maxWidth: '440px', width: '100%', background: '#1e293b', padding: '32px', borderRadius: '16px', border: '1px solid #334155' }}>
        <h2 style={{ color: '#2FC18E', marginTop: 0 }}>Driver Verification</h2>

        {status === 'pending' ? (
          <div style={{ padding: '20px', background: '#0369a1', borderRadius: '10px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px' }}>Application Pending</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Your credentials have been submitted for review. Once verified by an administrator, your dashboard will activate.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Legal Full Name</label>
              <input required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Phone Number</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Driver License Number</label>
              <input required value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Experience / Vehicle Type</label>
              <input required placeholder="Manual & Automatic Transmission" value={formData.vehicleDetails} onChange={e => setFormData({ ...formData, vehicleDetails: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Upload Driving License Photo</label>
              <input required type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
            </div>

            <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2FC18E', border: 'none', borderRadius: '8px', color: '#0f172a', fontWeight: 900, cursor: 'pointer', marginTop: '8px' }}>
              {loading ? 'Uploading & Submitting...' : 'Submit Credentials for Approval'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
