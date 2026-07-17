import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRentals } from '../services/api';
import PageBanner from '../components/PageBanner';

const STATUS_LABELS = {
  ACTIVE: 'Đang thuê',
  CHECKED_OUT: 'Đã trả phòng',
  PENDING: 'Chờ xác nhận',
};

const STATUS_COLORS = {
  ACTIVE:       { bg: '#e6f9ee', color: '#0a7c3e' },
  CHECKED_OUT:  { bg: '#f0f0f0', color: '#666' },
  PENDING:      { bg: '#fff8e1', color: '#e65100' },
};

export default function MyBookingsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchRentals = () => {
    setLoading(true);
    setError('');
    getMyRentals()
      .then(data => setRentals(Array.isArray(data) ? data : []))
      .catch(() => setError('Không thể tải danh sách đặt phòng. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
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
                        📅 Ngày nhận phòng:{' '}
                        <strong>
                          {rental.startDate
                            ? new Date(rental.startDate).toLocaleDateString('vi-VN')
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
