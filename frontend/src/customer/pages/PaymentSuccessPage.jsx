import { useSearchParams, Link } from 'react-router-dom';
import PageBanner from '../components/PageBanner';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const bookingId = searchParams.get('bookingId');

  const isSuccess = status === 'success';

  return (
    <>
      <PageBanner title={isSuccess ? "Thanh Toán Thành Công" : "Thanh Toán Thất Bại"} />

      <div style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 580 }}>
          <div style={{
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
            border: '1px solid #eee',
            padding: '40px 32px',
            textAlign: 'center',
          }}>
            {isSuccess ? (
              <>
                <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
                <h3 style={{ color: '#121212', fontWeight: 800, fontSize: 24, marginBottom: 10 }}>
                  Thanh Toán Đơn Đặt Thành Công!
                </h3>
                <p style={{ color: '#666', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
                  Cảm ơn quý khách đã hoàn tất đặt phòng. Trạng thái đặt phòng của bạn đã được cập nhật thành công trên hệ thống.
                </p>
                {bookingId && (
                  <div style={{
                    background: '#f9f9f9',
                    borderRadius: 12,
                    padding: '12px 18px',
                    fontSize: 13,
                    color: '#444',
                    marginBottom: 28,
                    fontFamily: 'mono',
                  }}>
                    Mã đơn đặt phòng:<br/>
                    <strong style={{ color: '#111' }}>{bookingId}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <Link to="/my-bookings" className="book_btn" style={{ maxWidth: 200 }}>
                    Lịch sử đặt phòng
                  </Link>
                  <Link to="/" className="book_btn" style={{ maxWidth: 160, background: '#eee', color: '#333' }}>
                    Trang chủ
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 72, marginBottom: 16 }}>⚠️</div>
                <h3 style={{ color: '#c00', fontWeight: 800, fontSize: 24, marginBottom: 10 }}>
                  Giao Dịch Thất Bại
                </h3>
                <p style={{ color: '#666', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
                  Có lỗi xảy ra hoặc bạn đã hủy giao dịch trên cổng thanh toán VNPay. Vui lòng kiểm tra lại số dư tài khoản hoặc thử lại.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <Link to="/rooms" className="book_btn" style={{ maxWidth: 180 }}>
                    Quay lại chọn phòng
                  </Link>
                  <Link to="/my-bookings" className="book_btn" style={{ maxWidth: 180, background: '#eee', color: '#333' }}>
                    Đơn đặt của tôi
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
