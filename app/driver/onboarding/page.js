'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function DriverOnboardingPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    licenseNumber: '',
    vehicleDetails: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    // 1. Get current logged in user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      setStatusMessage('Please login with Google first.');
      setIsSubmitting(false);
      return;
    }

    // 2. Insert or update driver profile record
    const { error: insertError } = await supabase
      .from('driver_profiles')
      .upsert({
        id: user.id,
        full_name: formData.fullName,
        phone: formData.phone,
        license_number: formData.licenseNumber,
        vehicle_details: formData.vehicleDetails,
        status: 'pending',
      });

    if (insertError) {
      setStatusMessage('Submission error: ' + insertError.message);
    } else {
      setStatusMessage('Profile submitted! Your status is currently: PENDING APPROVAL.');
    }
    setIsSubmitting(false);
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '12px', maxWidth: '420px', width: '100%', border: '1px solid #334155' }}>
        <h2 style={{ color: '#38bdf8', marginTop: 0 }}>Driver Verification</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>Provide your credentials to get approved for trips.</p>

        {statusMessage && (
          <div style={{ padding: '12px', marginBottom: '16px', borderRadius: '6px', backgroundColor: '#0284c7', fontSize: '0.875rem' }}>
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Full Legal Name</label>
            <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Phone Number</label>
            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Driving License Number</label>
            <input required type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Vehicle Model & Plate Number</label>
            <input required type="text" name="vehicleDetails" placeholder="e.g. Maruti Swift (KL-07-XX-0000)" value={formData.vehicleDetails} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }} />
          </div>

          <button type="submit" disabled={isSubmitting} style={{ padding: '12px', backgroundColor: '#38bdf8', border: 'none', borderRadius: '6px', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
            {isSubmitting ? 'Submitting...' : 'Submit Credentials'}
          </button>
        </form>
      </div>
    </main>
  );
}
