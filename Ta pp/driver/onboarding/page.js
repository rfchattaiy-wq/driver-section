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
  const [errorMsg, setErrorMsg] = useState('');

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

  const validateInputs = () => {
    // 1. പേര് പരിശോധന
    if (formData.fullName.trim().length < 3) {
      return 'ദയവായി നിങ്ങളുടെ പൂർണ്ണമായ പേര് നൽകുക (കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ).';
    }

    // 2. ഇന്ത്യൻ ഫോൺ നമ്പർ പരിശോധന (10 അക്കങ്ങൾ, 6-9 ൽ തുടങ്ങണം)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      return 'തെറ്റായ ഫോൺ നമ്പർ! ദയവായി സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക (സ്പേസോ +91 ഓ ചേർക്കരുത്).';
    }

    // 3. ഇന്ത്യൻ ലൈസൻസ് നമ്പർ ഫോർമാറ്റ് (ഉദാ: KL0720180004567 അല്ലെങ്കിൽ KL-07-2018-0004567)
    const dlRegex = /^[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{4}[-\s]?[0-9]{7}$/i;
    if (!dlRegex.test(formData.licenseNumber.trim())) {
      return 'തെറ്റായ ലൈസൻസ് നമ്പർ! ശരിയായ ഫോർമാറ്റ് നൽകുക (ഉദാ: KL0720180004567).';
    }

    if (!file) {
      return 'ദയവായി നിങ്ങളുടെ ഡ്രൈവിംഗ് ലൈസൻസ് ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const validationError = validateInputs();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    if (!user) return;
    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('licenses').upload(fileName, file);

      if (uploadError) {
        throw new Error('ഫോട്ടോ അപ്‌ലോഡ് പരാജയപ്പെട്ടു: ' + uploadError.message);
      }

      const { data } = supabase.storage.from('licenses').getPublicUrl(fileName);
      const licenseUrl = data.publicUrl;

      const { error: dbError } = await supabase.from('driver_profiles').upsert({
        id: user.id,
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        license_number: formData.licenseNumber.trim().toUpperCase(),
        vehicle_details: formData.vehicleDetails.trim(),
        license_url: licenseUrl,
        status: 'pending',
      });

      if (dbError) throw dbError;

      setStatus('pending');
    } catch (err) {
      setErrorMsg(err.message || 'ഒരു പിശക് സംഭവിച്ചു');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', padding: '32px 20px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ maxWidth: '440px', width: '100%', background: '#1e293b', padding: '32px', borderRadius: '16px', border: '1px solid #334155' }}>
        <h2 style={{ color: '#2FC18E', marginTop: 0 }}>ഡ്രൈവർ വെരിഫിക്കേഷൻ</h2>

        {status === 'pending' ? (
          <div style={{ padding: '20px', background: '#0369a1', borderRadius: '10px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px' }}>രേഖകൾ പരിശോധനയിലാണ്</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>നിങ്ങൾ നൽകിയ രേഖകൾ അഡ്മിൻ പരിശോധിച്ചു വരികയാണ്. അംഗീകാരം ലഭിച്ചാലുടൻ നിങ്ങളുടെ ഡാഷ്‌ബോർഡ് ലഭ്യമാകും.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {errorMsg && (
              <div style={{ padding: '10px', background: '#dc2626', borderRadius: '6px', fontSize: '0.85rem' }}>
                {errorMsg}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>പൂർണ്ണമായ പേര്</label>
              <input required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} placeholder="ഉദാ: രാഹുൽ കൃഷ്ണൻ" style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>മൊബൈൽ നമ്പർ (10 അക്കങ്ങൾ)</label>
              <input required type="tel" maxLength={10} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="9876543210" style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ഡ്രൈവിംഗ് ലൈസൻസ് നമ്പർ</label>
              <input required value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} placeholder="KL0720180004567" style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>വാഹന പരിചയം</label>
              <input required placeholder="Manual & Automatic Cars" value={formData.vehicleDetails} onChange={e => setFormData({ ...formData, vehicleDetails: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ലൈസൻസ് ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക</label>
              <input required type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
            </div>

            <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2FC18E', border: 'none', borderRadius: '8px', color: '#0f172a', fontWeight: 900, cursor: 'pointer', marginTop: '8px' }}>
              {loading ? 'രേഖകൾ അപ്‌ലോഡ് ചെയ്യുന്നു...' : 'പരിശോധനക്കായി സമർപ്പിക്കുക'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
