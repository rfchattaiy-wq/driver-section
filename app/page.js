'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickup: '',
    destination: '',
    date: '',
    time: '',
    duration: 2,
    transmission: 'Manual',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('bookings').insert([
      {
        customer_name: formData.name,
        customer_phone: formData.phone,
        pickup_location: formData.pickup,
        destination: formData.destination,
        pickup_date: formData.date,
        pickup_time: formData.time,
        duration_hours: Number(formData.duration),
        transmission_type: formData.transmission,
      },
    ]);

    setLoading(false);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Booking successful!');
      const msg = encodeURIComponent(
        `New Booking:\nName: ${formData.name}\nPickup: ${formData.pickup}\nDate: ${formData.date} ${formData.time}`
      );
      window.location.href = `https://wa.me/919999999999?text=${msg}`;
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Book a Driver</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="Your Name"
          required
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ padding: '8px' }}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          required
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          style={{ padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Pickup Location"
          required
          onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
          style={{ padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Destination"
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          style={{ padding: '8px' }}
        />
        <input
          type="date"
          required
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          style={{ padding: '8px' }}
        />
        <input
          type="time"
          required
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          style={{ padding: '8px' }}
        />
        <select
          onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
          style={{ padding: '8px' }}
        >
          <option value="Manual">Manual Car</option>
          <option value="Automatic">Automatic Car</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Submitting...' : 'Submit Booking'}
        </button>
      </form>
    </div>
  );
}
