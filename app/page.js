'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ n: '', p: '', t: 'Daily commute', d: '' });
  
  // ലൊക്കേഷൻ സെർച്ച് & വെരിഫിക്കേഷൻ സ്റ്റേറ്റുകൾ
  const [locationQuery, setLocationQuery] = useState('');
  const [verifiedLocation, setVerifiedLocation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);

  const [statusMsg, setStatusMsg] = useState({ text: '', color: '' });
  const [loading, setLoading] = useState(false);

  // മിനിമം സമയം - ഇപ്പോൾ ഉള്ള സമയം
  const currentDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  // ടൈപ്പ് ചെയ്യുമ്പോൾ ലൈവായി സ്ഥലം പരിശോധിക്കുന്ന ഫംഗ്ഷൻ (Nominatim OpenStreetMap)
  useEffect(() => {
    if (locationQuery.trim().length < 3 || verifiedLocation?.display_name === locationQuery) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLoc(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(locationQuery)}&limit=5`
        );
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error('Error fetching places:', err);
      } finally {
        setIsSearchingLoc(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [locationQuery, verifiedLocation]);

  const handleSelectPlace = (place) => {
    setVerifiedLocation(place);
    setLocationQuery(place.display_name);
    setSuggestions([]);
  };

  const handleLocationInputChange = (e) => {
    setLocationQuery(e.target.value);
    setVerifiedLocation(null);
  };

  const validateBookingForm = () => {
    const name = formData.n.trim();
    const phone = formData.p.trim();
    const date = formData.d.trim();

    // 1. പേര് പരിശോധന
    const nameRegex = /^[a-zA-Z\s]{3,40}$/;
    if (!nameRegex.test(name)) {
      return 'ദയവായി സാധുവായ ഒരു പേര് നൽകുക (കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ).';
    }

    // 2. ഫോൺ നമ്പർ പരിശോധന (10 അക്ക ഇന്ത്യൻ നമ്പർ)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return 'തെറ്റായ ഫോൺ നമ്പർ! 6, 7, 8 അല്ലെങ്കിൽ 9 ൽ ആരംഭിക്കുന്ന 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.';
    }

    // 3. തീയതി പരിശോധന
    if (!date) {
      return 'യാത്ര ആവശ്യമുള്ള തീയതിയും സമയവും തിരഞ്ഞെടുക്കുക.';
    }
    if (new Date(date) < new Date()) {
      return 'കഴിഞ്ഞുപോയ സമയം തിരഞ്ഞെടുക്കാൻ കഴിയില്ല. ഭാവിയിലുള്ള സമയം നൽകുക.';
    }

    // 4. ഒറിജിനൽ ലൊക്കേഷൻ വെരിഫിക്കേഷൻ ചെക്ക്
    if (!verifiedLocation) {
      return 'തെറ്റായ ലൊക്കേഷൻ! നിങ്ങൾ ടൈപ്പ് ചെയ്യുമ്പോൾ താഴെ കാണിക്കുന്ന ലിസ്റ്റിൽ നിന്ന് യഥാർത്ഥ സ്ഥലം ക്ലിക്ക് ചെയ്ത് സെലക്ട് ചെയ്യുക.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ text: '', color: '' });

    const error = validateBookingForm();
    if (error) {
      setStatusMsg({ text: error, color: '#ef4444' });
      return;
    }

    setLoading(true);
    const { error: insertError } = await supabase.from('rides').insert({
      rider_name: formData.n.trim(),
      rider_phone: formData.p.trim(),
      trip_type: formData.t,
      scheduled_time: formData.d,
      pickup_location: verifiedLocation.display_name,
      dropoff_location: 'സ്ഥിരീകരണ കോളിൽ അറിയിക്കുക',
      status: 'requested',
    });

    if (insertError) {
      setStatusMsg({ text: 'ബുക്കിംഗ് പരാജയപ്പെട്ടു: ' + insertError.message, color: '#ef4444' });
    } else {
      setStatusMsg({
        text: `നന്ദി, ${formData.n.trim()}! നിങ്ങളുടെ ബുക്കിംഗ് വിജയകരമായി രജിസ്റ്റർ ചെയ്തു. നൽകിയ സ്ഥലം: ${verifiedLocation.display_name}`,
        color: '#22c55e'
      });
      setFormData({ n: '', p: '', t: 'Daily commute', d: '' });
      setLocationQuery('');
      setVerifiedLocation(null);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7FAF9', color: '#16283A', fontFamily: 'sans-serif' }}>
      
      {/* SVG Symbol */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="roadGrad" x1="0%" y1="70%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#1467B8" />
            <stop offset="55%" stopColor="#1B9AB0" />
            <stop offset="100%" stopColor="#2FC18E" />
          </linearGradient>
        </defs>
        <symbol id="easydrive-mark" viewBox="0 0 200 130">
          <path d="M 28 105 C 42 70, 72 45, 112 48 C 142 50, 150 18, 118 10 C 86 2, 74 38, 74 62 C 74 96, 115 108, 142 98 C 158 92, 172 78, 182 60" fill="none" stroke="url(#roadGrad)" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 28 105 C 42 70, 72 45, 112 48 C 142 50, 150 18, 118 10 C 86 2, 74 38, 74 62 C 74 96, 115 108, 142 98 C 158 92, 172 78, 182 60" fill="none" stroke="#FFFFFF" strokeWidth="2.3" strokeDasharray="6 7" strokeLinecap="round" opacity="0.95" />
          <polygon points="172,32 196,52 170,7
