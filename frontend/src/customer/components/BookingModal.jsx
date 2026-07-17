import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createRental } from '../services/api';
import { useLanguage } from '../../context/LanguageContext';

const EMPTY_GUEST = { customerName: '', customerType: 'DOMESTIC', idCard: '', address: '' };

export default function BookingModal({ room, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [startDate, setStartDate] = useState('');
  const [guests, setGuests] = useState([{ ...EMPTY_GUEST }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Price estimate
  const basePrice = Number(room.price || room.basePrice || 0);
  const hasForeign = guests.some(g => g.customerType === 'FOREIGN');
  const surcharge  = guests.length >= 3 ? 0.25 : 0;
  const coefficient = hasForeign ? 1.5 : 1;
  const estimatedDays = startDate
    ? Math.max(1, Math.ceil((new Date() - new Date(startDate)) / 86400000) || 1)
    : 1;
  const estimatedTotal = Math.round(basePrice * (1 + surcharge) * coefficient * estimatedDays);

  const addGuest = () => {
    if (guests.length >= 3) return;
    setGuests(g => [...g, { ...EMPTY_GUEST }]);
  };

  const removeGuest = (i) => setGuests(g => g.filter((_, idx) => idx !== i));

  const updateGuest = (i, field, value) =>
    setGuests(g => g.map((guest, idx) => idx === i ? { ...guest, [field]: value } : guest));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const isoDate = startDate
        ? `${startDate}T14:00:00`
        : new Date().toISOString().slice(0, 19);
      await createRental(room.id, isoDate, guests);
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.customers
        || 'Đặt phòng thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="booking-overlay" onClick={onClose}>
        <div className="booking-modal" onClick={e => e.stopPropagation()}>
          <div className="booking-modal-header">
            <h3>{t('booking.successTitle')}</h3>
            <button className="booking-close" onClick={onClose}>✕</button>
          </div>
          <div className="booking-modal-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
            <p style={{ fontSize: 16, marginBottom: 8 }}>
              Phòng <strong>{room.roomNumber}</strong> đã được đặt thành công!
            </p>
            <p style={{ color: '#666', marginBottom: 24 }}>
              {t('booking.successDesc')}
            </p>
            <button className="book_btn" style={{ display: 'inline-block', maxWidth: 160 }} onClick={onClose}>
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="booking-modal-header">
          <div>
            <h3 style={{ margin: 0 }}>{t('booking.title')} {room.roomNumber}</h3>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>
              {t('rooms.typePrefix')} {room.roomTypeName} — {Number(room.price || room.basePrice || 0).toLocaleString('vi-VN')} {t('home.pricePerDay')}
            </p>
          </div>
          <button className="booking-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="booking-modal-body">
          {error && (
            <div style={{ background: '#ffe0e0', border: '1px solid #ff0909', padding: '10px 14px', borderRadius: 6, marginBottom: 16, color: '#c00', fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Checkin Date */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
                {t('booking.checkinDate')}
              </label>
              <input
                className="online_book"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ paddingRight: 16, marginBottom: 0 }}
              />
            </div>

            {/* Guests */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>
                  {t('booking.guestsLabel')} ({guests.length}/3)
                </label>
                {guests.length < 3 && (
                  <button type="button" onClick={addGuest} style={{ background: '#121212', color: '#fff', border: 'none', borderRadius: 20, padding: '4px 14px', fontSize: 13, cursor: 'pointer' }}>
                    {t('booking.addGuest')}
                  </button>
                )}
              </div>

              {guests.map((guest, i) => (
                <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: '14px 16px', marginBottom: 12, background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#ff0909' }}>Khách / Guest {i + 1}</span>
                    {guests.length > 1 && (
                      <button type="button" onClick={() => removeGuest(i)} style={{ background: 'transparent', color: '#999', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>
                        ×
                      </button>
                    )}
                  </div>

                  <input
                    className="contactus"
                    placeholder={t('booking.guestName')}
                    type="text"
                    value={guest.customerName}
                    onChange={e => updateGuest(i, 'customerName', e.target.value)}
                    required
                    style={{ marginBottom: 10 }}
                  />
                  <input
                    className="contactus"
                    placeholder={t('booking.idCard')}
                    type="text"
                    value={guest.idCard}
                    onChange={e => updateGuest(i, 'idCard', e.target.value)}
                    required
                    style={{ marginBottom: 10 }}
                  />
                  <input
                    className="contactus"
                    placeholder={t('booking.address')}
                    type="text"
                    value={guest.address}
                    onChange={e => updateGuest(i, 'address', e.target.value)}
                    style={{ marginBottom: 10 }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['DOMESTIC', 'FOREIGN'].map(type => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                        <input
                          type="radio"
                          name={`type-${i}`}
                          value={type}
                          checked={guest.customerType === type}
                          onChange={() => updateGuest(i, 'customerType', type)}
                        />
                        {type === 'DOMESTIC' ? t('booking.domestic') : t('booking.foreign')}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="book_btn" style={{ width: '100%', maxWidth: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? t('common.loading') : t('booking.confirmBtn')}
            </button>

            {/* Price estimate */}
            <div style={{
              marginTop: 16, padding: '14px 16px', background: '#fff8f8',
              border: '1px solid #ffe0e0', borderRadius: 8,
            }}>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
                💰 Ước tính chi phí ({estimatedDays} ngày):
                {guests.length >= 3 && <span style={{ color: '#ff0909', marginLeft: 6 }}>+25% phụ thu 3 khách</span>}
                {hasForeign && <span style={{ color: '#ff0909', marginLeft: 6 }}>×1.5 khách nước ngoài</span>}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#ff0909' }}>
                {estimatedTotal.toLocaleString('vi-VN')} đ
              </div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                * Số ngày thực tế tính khi check-out
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
