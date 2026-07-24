import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getMyBookings, cancelBooking } from '../services/api';
import PageBanner from '../components/PageBanner';

const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã nhận phòng',
  CANCELLED: 'Đã hủy',
};

const STATUS_COLORS = {
  PENDING:      { bg: '#fff8e1', color: '#e65100' },
  CONFIRMED:    { bg: '#e8f0fe', color: '#1a73e8' },
  CHECKED_IN:   { bg: '#e6f9ee', color: '#0a7c3e' },
  CANCELLED:    { bg: '#ffe0e0', color: '#c00' },
};

export default function MyBookingsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Review states (Phase 3)
  const [writingReviewRoom, setWritingReviewRoom] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchRentals = () => {
    setLoading(true);
    setError('');
    getMyBookings()
      .then(data => setRentals(Array.isArray(data) ? data : []))
      .catch(() => setError('Không thể tải danh sách đặt phòng. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!writingReviewRoom || !comment.trim()) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        roomTypeId: writingReviewRoom.roomTypeId,
        rating,
        comment: comment.trim()
      });
      alert('Đăng đánh giá thành công! Cảm ơn ý kiến của bạn.');
      setWritingReviewRoom(null);
      setRating(5);
      setComment('');
    } catch {
      alert('Không thể lưu đánh giá. Vui lòng kiểm tra lại.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt phòng này?')) return;
    try {
      await cancelBooking(bookingId);
      fetchRentals();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy đơn đặt phòng.');
    }
  };

  useEffect(() => { fetchRentals(); }, []);

  return (
    <>
      <PageBanner title="Đặt Phòng Của Tôi" />

      <div style={{ paddingTop: 50, paddingBottom: 70 }}>
        <div className="container">

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ color: '#888', fontSize: 16 }}>⏳ Đang tải...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: '#c00', fontSize: 16, marginBottom: 16 }}>{error}</p>
              <button
                onClick={fetchRentals}
                style={{
                  background: '#ff0909', color: '#fff', border: 'none',
                  borderRadius: 30, padding: '10px 28px', fontWeight: 700,
                  cursor: 'pointer', fontSize: 14,
                }}
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && rentals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f9f9f9', borderRadius: 16 }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🛎️</div>
              <h4 style={{ color: '#333', marginBottom: 8 }}>Bạn chưa có đặt phòng nào</h4>
              <p style={{ color: '#777', marginBottom: 20 }}>Khám phá danh sách phòng và đặt ngay hôm nay!</p>
              <Link
                to="/rooms"
                className="read_more"
                style={{ display: 'inline-block' }}
              >
                Xem phòng
              </Link>
            </div>
          )}

          {/* Rental list */}
          {!loading && !error && rentals.length > 0 && (
            <div>
              {rentals.map((rental) => {
                const statusStyle = STATUS_COLORS[rental.status] || STATUS_COLORS.PENDING;
                return (
                  <div
                    key={rental.id}
                    style={{
                      background: '#fff', borderRadius: 12,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      border: '1px solid #eee', padding: '20px 24px',
                      marginBottom: 16, display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center',
                      flexWrap: 'wrap', gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 17, color: '#121212', marginBottom: 4 }}>
                        🏨 Phòng {rental.roomNumber}
                        {rental.roomTypeName && (
                          <span style={{
                            marginLeft: 10, background: '#f0f0f0',
                            padding: '2px 10px', borderRadius: 12,
                            fontSize: 12, fontWeight: 600, color: '#444',
                          }}>
                            Loại {rental.roomTypeName}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: '#666' }}>
                        📅 Thời gian:{' '}
                        <strong>
                          {rental.checkInDate
                            ? new Date(rental.checkInDate).toLocaleDateString('vi-VN')
                            : '—'}
                        </strong>
                        {' '}-{' '}
                        <strong>
                          {rental.checkOutDate
                            ? new Date(rental.checkOutDate).toLocaleDateString('vi-VN')
                            : '—'}
                        </strong>
                      </div>
                      {rental.guests && rental.guests.length > 0 && (
                        <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                          👥 {rental.guests.length} khách:{' '}
                          {rental.guests.map(g => g.customerName).join(', ')}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block', padding: '5px 16px',
                        borderRadius: 20, fontWeight: 600, fontSize: 13,
                        background: statusStyle.bg, color: statusStyle.color,
                      }}>
                        {STATUS_LABELS[rental.status] || rental.status}
                      </span>
                      {rental.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => setWritingReviewRoom({ roomTypeId: rental.roomTypeId, roomTypeName: rental.roomTypeName })}
                          style={{
                            display: 'block', width: '100%', marginTop: 8, padding: '6px 14px',
                            fontSize: 12, border: 'none', background: '#ff0909', color: '#fff',
                            borderRadius: 16, cursor: 'pointer', fontWeight: 600, textAlign: 'center'
                          }}
                        >
                          ★ Đánh giá
                        </button>
                      )}
                      {(rental.status === 'PENDING' || rental.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleCancelBooking(rental.id)}
                          style={{
                            display: 'block', width: '100%', marginTop: 8, padding: '6px 14px',
                            fontSize: 12, border: '1px solid #c00', background: '#fff', color: '#c00',
                            borderRadius: 16, cursor: 'pointer', fontWeight: 600, textAlign: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#c00'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#c00'; }}
                        >
                          ✕ Hủy đặt phòng
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Write Review Modal (Phase 3) */}
      {writingReviewRoom && (
        <div className="booking-overlay" onClick={() => setWritingReviewRoom(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 16
        }}>
          <div className="booking-modal" onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 450,
            overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          }}>
            <div className="booking-modal-header" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid #eee'
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 750 }}>Đánh giá Loại phòng {writingReviewRoom.roomTypeName}</h3>
              <button className="booking-close" onClick={() => setWritingReviewRoom(null)} style={{
                background: 'none', border: 'none', fontSize: 20, cursor: 'pointer'
              }}>✕</button>
            </div>
            <form onSubmit={handleReviewSubmit} style={{ padding: 20 }}>
              <div style={{ marginBottom: 16, textAlign: 'left' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Số sao / Stars</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'none', border: 'none', fontSize: 24,
                        color: star <= rating ? '#fbbf24' : '#ccc', cursor: 'pointer', padding: 0
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20, textAlign: 'left' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Nhận xét / Review Comment</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về căn phòng này..."
                  required
                  rows="4"
                  style={{
                    width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd',
                    fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="book_btn"
                style={{ width: '100%', maxWidth: '100%', border: 'none', cursor: 'pointer' }}
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
