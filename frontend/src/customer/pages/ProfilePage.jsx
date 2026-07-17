import { useAuth } from '../context/AuthContext';
import PageBanner from '../components/PageBanner';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <PageBanner title="Hồ Sơ Của Tôi" />

      <div style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div style={{
                background: '#fff', borderRadius: 16,
                boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                border: '1px solid #eee', padding: '36px 40px',
              }}>
                {/* Avatar */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff0909, #ff6b6b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 28,
                    margin: '0 auto 12px',
                  }}>
                    {(user.fullName || user.username).substring(0, 1).toUpperCase()}
                  </div>
                  <h3 style={{ color: '#121212', fontWeight: 700, margin: 0 }}>
                    {user.fullName || user.username}
                  </h3>
                  <span style={{
                    display: 'inline-block', marginTop: 8,
                    background: '#fff3f3', color: '#ff0909',
                    padding: '4px 16px', borderRadius: 20,
                    fontSize: 13, fontWeight: 600, border: '1px solid #ffcdd2',
                  }}>
                    Khách hàng
                  </span>
                </div>

                {/* Info rows */}
                {[
                  { label: 'Họ và tên', value: user.fullName || user.username },
                  { label: 'Tên đăng nhập', value: user.username },
                  { label: 'Mã khách hàng', value: `#${user.userId}` },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '14px 0', borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <span style={{ color: '#888', fontSize: 14 }}>{label}</span>
                    <span style={{ color: '#121212', fontWeight: 600, fontSize: 14 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
