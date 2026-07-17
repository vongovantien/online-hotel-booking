import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StaffBanner() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || (user.role !== 'RECEPTIONIST' && user.role !== 'ADMIN')) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#fef3c7', color: '#92400e',
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
      fontSize: 14, fontWeight: 500,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <span>⚠️</span>
      <span>Bạn đang đăng nhập với tư cách nhân viên ({user.role}).</span>
      <a
        href="/admin"
        style={{
          color: '#92400e', fontWeight: 700,
          textDecoration: 'underline', whiteSpace: 'nowrap',
        }}
      >
        Vào Admin Portal →
      </a>
      <button
        onClick={handleLogout}
        style={{
          marginLeft: 'auto', background: 'transparent',
          border: '1px solid #92400e', color: '#92400e',
          borderRadius: 20, padding: '4px 14px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Đăng xuất
      </button>
    </div>
  );
}
