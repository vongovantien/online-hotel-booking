import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);

  const NAV_LINKS = [
    { to: '/',        label: t('nav.home') },
    { to: '/about',   label: t('nav.about') },
    { to: '/rooms',   label: t('nav.rooms') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setOpen(false);
  };

  return (
    <header>
      <div className="header" style={{ height: 'auto', minHeight: 86 }}>
        <div className="container">
          <div className="row" style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
            {/* Logo */}
            <div style={{ flex: '0 0 auto', padding: '0 15px' }}>
              <Link to="/">
                <img src="/images/logo.png" alt="Hotel Logo"
                  style={{ maxHeight: 54, width: 'auto', display: 'block' }} />
              </Link>
            </div>

            {/* Desktop nav */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 15px', gap: 4 }}>

              {/* Desktop links — hidden on mobile */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: 0 }} className="d-none-mobile">
                {NAV_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    style={{
                      padding: '7px 16px 27px',
                      color: pathname === to ? '#fe0000' : '#010101',
                      fontSize: 15, fontWeight: 500, textDecoration: 'none',
                      borderBottom: pathname === to ? '3px solid #fe0000' : '3px solid transparent',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Lang toggle */}
              <button
                onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
                title="Switch language"
                style={{
                  background: '#f5f5f5', border: '1px solid #ddd',
                  borderRadius: 20, padding: '5px 12px', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', marginLeft: 8,
                  color: '#333', transition: 'all 0.2s',
                }}
              >
                {lang === 'vi' ? '🇬🇧 EN' : '🇻🇳 VI'}
              </button>

              {/* Auth buttons — desktop */}
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }} className="d-none-mobile">
                  <span style={{
                    color: '#ff0909', fontWeight: 600, fontSize: 13,
                    padding: '4px 12px', background: '#fff3f3',
                    borderRadius: 20, border: '1px solid #ffcdd2', whiteSpace: 'nowrap',
                  }}>
                    👤 {user.fullName || user.username}
                  </span>
                  {user.role === 'CUSTOMER' && (
                    <>
                      <Link
                        to="/my-bookings"
                        onClick={() => setOpen(false)}
                        style={{
                          color: '#010101', fontWeight: 500, fontSize: 14,
                          textDecoration: 'none', padding: '6px 14px',
                          borderRadius: 20, border: '1px solid #ddd',
                          transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}
                      >
                        📋 Đặt phòng
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        style={{
                          color: '#010101', fontWeight: 500, fontSize: 14,
                          textDecoration: 'none', padding: '6px 14px',
                          borderRadius: 20, border: '1px solid #ddd',
                          transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}
                      >
                        👤 Hồ sơ
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      background: '#ff0909', color: '#fff', border: 'none',
                      borderRadius: 20, padding: '6px 14px', fontSize: 13,
                      cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
                    }}
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }} className="d-none-mobile">
                  <Link
                    to="/login"
                    style={{
                      color: '#010101', fontWeight: 500, fontSize: 14,
                      textDecoration: 'none', padding: '6px 14px',
                      borderRadius: 20, border: '1px solid #ddd',
                      transition: 'all 0.2s', whiteSpace: 'nowrap',
                    }}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    style={{
                      background: '#ff0909', color: '#fff', fontWeight: 600,
                      fontSize: 14, textDecoration: 'none', padding: '6px 16px',
                      borderRadius: 20, whiteSpace: 'nowrap',
                    }}
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setOpen(o => !o)}
                className="d-show-mobile"
                style={{
                  background: 'transparent', border: '1px solid #ddd',
                  borderRadius: 6, padding: '6px 10px',
                  cursor: 'pointer', marginLeft: 8, display: 'none',
                }}
                aria-label="Toggle menu"
              >
                <span style={{ display: 'block', width: 22, height: 2, background: '#333', marginBottom: 5 }} />
                <span style={{ display: 'block', width: 22, height: 2, background: '#333', marginBottom: 5 }} />
                <span style={{ display: 'block', width: 22, height: 2, background: '#333' }} />
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {open && (
            <div style={{
              background: '#0f1521', padding: '16px 20px',
              borderTop: '2px solid #ff0909', position: 'absolute',
              left: 0, right: 0, zIndex: 9998,
            }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {NAV_LINKS.map(({ to, label }) => (
                  <li key={to} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Link
                      to={to}
                      onClick={() => setOpen(false)}
                      style={{
                        display: 'block', padding: '12px 0',
                        color: pathname === to ? '#ff0909' : '#fff',
                        textDecoration: 'none', fontSize: 15,
                        fontWeight: pathname === to ? 700 : 400,
                      }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}

                <li style={{ paddingTop: 16 }}>
                  {user ? (
                    <div>
                      <p style={{ color: '#ccc', fontSize: 13, marginBottom: 10 }}>
                        👤 {user.fullName || user.username}
                      </p>
                      {user.role === 'CUSTOMER' && (
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                          <Link to="/my-bookings" onClick={() => setOpen(false)} style={{
                            flex: 1, textAlign: 'center', padding: '10px 0',
                            border: '1px solid #fff', color: '#fff', borderRadius: 20,
                            textDecoration: 'none', fontWeight: 600, fontSize: 13,
                          }}>
                            📋 Đặt phòng
                          </Link>
                          <Link to="/profile" onClick={() => setOpen(false)} style={{
                            flex: 1, textAlign: 'center', padding: '10px 0',
                            border: '1px solid #fff', color: '#fff', borderRadius: 20,
                            textDecoration: 'none', fontWeight: 600, fontSize: 13,
                          }}>
                            👤 Hồ sơ
                          </Link>
                        </div>
                      )}
                      <button onClick={handleLogout} style={{
                        display: 'block', width: '100%',
                        background: '#ff0909', color: '#fff', border: 'none',
                        borderRadius: 20, padding: '10px', cursor: 'pointer', fontWeight: 600,
                        marginTop: 10,
                      }}>
                        {t('nav.logout')}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Link to="/login" onClick={() => setOpen(false)} style={{
                        flex: 1, textAlign: 'center', padding: '10px 0',
                        border: '1px solid #fff', color: '#fff', borderRadius: 20,
                        textDecoration: 'none', fontWeight: 600,
                      }}>
                        {t('nav.login')}
                      </Link>
                      <Link to="/register" onClick={() => setOpen(false)} style={{
                        flex: 1, textAlign: 'center', padding: '10px 0',
                        background: '#ff0909', color: '#fff', borderRadius: 20,
                        textDecoration: 'none', fontWeight: 600,
                      }}>
                        {t('nav.register')}
                      </Link>
                    </div>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Responsive: show hamburger + hide desktop links on small screens */}
      <style>{`
        @media (max-width: 767px) {
          .d-none-mobile { display: none !important; }
          .d-show-mobile { display: block !important; }
          .main-layout .header { position: relative; }
        }
      `}</style>
    </header>
  );
}
