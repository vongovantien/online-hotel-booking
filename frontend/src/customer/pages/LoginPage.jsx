import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageBanner from '../components/PageBanner';
import { useLanguage } from '../../context/LanguageContext';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const from = location.state?.from || '/rooms';

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    const dest = user.role === 'CUSTOMER' ? '/' : '/admin';
    return <Navigate to={dest} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate(from, { replace: true });
    } catch {
      setError('Tên đăng nhập hoặc mật khẩu không đúng / Incorrect username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBanner title={t('auth.loginTitle')} />
      <div className="contact" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="titlepage" style={{ textAlign: 'center', paddingBottom: 30 }}>
                <h2>{t('auth.loginTitle')}</h2>
                <p>{t('auth.loginSub')}</p>
              </div>

              {error && (
                <div style={{ background: '#ffe0e0', border: '1px solid #ff0909', padding: '12px 16px', borderRadius: 6, marginBottom: 20, color: '#c00' }}>
                  {error}
                </div>
              )}

              <form className="main_form" onSubmit={handleSubmit}>
                <input
                  className="contactus"
                  placeholder={t('auth.usernamePlaceholder')}
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                />
                <input
                  className="contactus"
                  placeholder={t('auth.passwordPlaceholder')}
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="submit" className="send_btn" disabled={loading}>
                  {loading ? t('auth.loggingIn') : t('auth.loginBtn')}
                </button>
              </form>

              <p style={{ marginTop: 20, textAlign: 'center', fontSize: 15 }}>
                {t('auth.noAccount')}{' '}
                <Link to="/register" style={{ color: '#ff0909', fontWeight: 600 }}>{t('auth.registerNow')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
