import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageBanner from '../components/PageBanner';
import { useLanguage } from '../../context/LanguageContext';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    const dest = user.role === 'CUSTOMER' ? '/' : '/admin';
    return <Navigate to={dest} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.password, form.fullName, form.email);
      navigate('/rooms');
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.username
        || err.response?.data?.errors?.email
        || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBanner title={t('auth.registerTitle')} />
      <div className="contact" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="titlepage" style={{ textAlign: 'center', paddingBottom: 30 }}>
                <h2>{t('auth.registerTitle')}</h2>
                <p>{t('auth.registerSub')}</p>
              </div>

              {error && (
                <div style={{
                  background: '#ffe0e0', border: '1px solid #ff0909',
                  padding: '12px 16px', borderRadius: 6, marginBottom: 20, color: '#c00'
                }}>
                  {error}
                </div>
              )}

              <form className="main_form" onSubmit={handleSubmit}>
                <input
                  className="contactus"
                  placeholder={t('auth.fullNamePlaceholder')}
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  required
                />
                <input
                  className="contactus"
                  placeholder={t('auth.usernamePlaceholder')}
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                  minLength={3}
                />
                <input
                  className="contactus"
                  placeholder="Email *"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
                <input
                  className="contactus"
                  placeholder={`${t('auth.passwordPlaceholder')} (tối thiểu 8 ký tự)`}
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                />
                <button type="submit" className="send_btn" disabled={loading}>
                  {loading ? t('auth.registering') : t('auth.registerBtn')}
                </button>
              </form>

              <p style={{ marginTop: 20, textAlign: 'center', fontSize: 15 }}>
                {t('auth.haveAccount')}{' '}
                <Link to="/login" style={{ color: '#ff0909', fontWeight: 600 }}>
                  {t('auth.loginBtn')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
