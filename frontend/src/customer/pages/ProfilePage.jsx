import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PageBanner from '../components/PageBanner';
import api from '../../lib/axios';

export default function ProfilePage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailMsg, setEmailMsg] = useState({ text: '', type: '' });
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  if (!user) return null;

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailMsg({ text: '', type: '' });
    if (!email.trim()) return;
    setLoadingEmail(true);
    try {
      await api.put('/auth/profile', null, { params: { email: email.trim() } });
      setEmailMsg({ text: 'Cập nhật email thành công!', type: 'success' });
    } catch (err) {
      setEmailMsg({ text: err.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });
    if (newPassword !== confirmPassword) {
      setPassMsg({ text: 'Mật khẩu xác nhận không khớp', type: 'error' });
      return;
    }
    setLoadingPass(true);
    try {
      await api.put('/auth/change-password', null, { params: { oldPassword, newPassword } });
      setPassMsg({ text: 'Đổi mật khẩu thành công!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassMsg({ text: err.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <>
      <PageBanner title="Hồ Sơ Của Tôi" />

      <div style={{ paddingTop: 60, paddingBottom: 80, background: '#fafafa' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 30 }}>
            
            {/* Left Col: Summary Card */}
            <div>
              <div style={{
                background: '#fff', borderRadius: 16,
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                border: '1px solid #eee', padding: '36px 30px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff0909, #ff6b6b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 28,
                  margin: '0 auto 12px',
                }}>
                  {user.username.substring(0, 1).toUpperCase()}
                </div>
                <h3 style={{ color: '#121212', fontWeight: 700, margin: 0, fontSize: 18 }}>
                  {user.username}
                </h3>
                <span style={{
                  display: 'inline-block', marginTop: 8,
                  background: '#fff3f3', color: '#ff0909',
                  padding: '4px 16px', borderRadius: 20,
                  fontSize: 12, fontWeight: 600, border: '1px solid #ffcdd2',
                }}>
                  {user.role === 'CUSTOMER' ? 'Khách hàng' : user.role === 'ADMIN' ? 'Admin' : 'Lễ tân'}
                </span>
                
                <div style={{ marginTop: 24, textAlign: 'left', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Mã tài khoản:</div>
                  <div style={{ fontSize: 14, fontWeight: 650, color: '#222', fontFamily: 'monospace' }}>#{user.userId}</div>
                </div>
              </div>
            </div>

            {/* Right Col: Forms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Profile details */}
              <div style={{
                background: '#fff', borderRadius: 16,
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                border: '1px solid #eee', padding: 24
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 750, color: '#111' }}>✉️ Thông tin liên hệ</h4>
                <form onSubmit={handleUpdateEmail} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
                      Địa chỉ Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 8,
                        border: '1px solid #ddd', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  {emailMsg.text && (
                    <div style={{
                      fontSize: 13, color: emailMsg.type === 'success' ? '#007f3f' : '#d32f2f',
                      fontWeight: 600
                    }}>
                      {emailMsg.type === 'success' ? '✅' : '❌'} {emailMsg.text}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loadingEmail}
                    className="book_btn"
                    style={{ maxWidth: 160, border: 'none', cursor: 'pointer', fontSize: 13, padding: '10px 0' }}
                  >
                    {loadingEmail ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              </div>

              {/* Password update */}
              <div style={{
                background: '#fff', borderRadius: 16,
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                border: '1px solid #eee', padding: 24
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 750, color: '#111' }}>🔒 Đổi mật khẩu</h4>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
                      Mật khẩu cũ
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 8,
                        border: '1px solid #ddd', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 8,
                        border: '1px solid #ddd', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 8,
                        border: '1px solid #ddd', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  {passMsg.text && (
                    <div style={{
                      fontSize: 13, color: passMsg.type === 'success' ? '#007f3f' : '#d32f2f',
                      fontWeight: 600
                    }}>
                      {passMsg.type === 'success' ? '✅' : '❌'} {passMsg.text}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loadingPass}
                    className="book_btn"
                    style={{ maxWidth: 160, border: 'none', cursor: 'pointer', fontSize: 13, padding: '10px 0' }}
                  >
                    {loadingPass ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
