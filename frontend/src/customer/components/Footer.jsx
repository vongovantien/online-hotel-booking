import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');

  const menuLinks = [
    { to: '/',        label: t('nav.home') },
    { to: '/about',   label: t('nav.about') },
    { to: '/rooms',   label: t('nav.rooms') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer>
      <div className="footer">
        <div className="container">
          <div className="row">
            {/* Contact info */}
            <div className="col-md-4">
              <h3>{t('footer.contactUs')}</h3>
              <ul className="conta">
                <li><i className="fa fa-map-marker" aria-hidden="true"></i> 123 Hotel Street, City</li>
                <li><i className="fa fa-mobile" aria-hidden="true"></i> +01 1234569540</li>
                <li>
                  <i className="fa fa-envelope" aria-hidden="true"></i>
                  <a href="mailto:hotel@gmail.com"> hotel@gmail.com</a>
                </li>
              </ul>
            </div>

            {/* Menu links */}
            <div className="col-md-4">
              <h3>{t('footer.menuLinks')}</h3>
              <ul className="link_menu">
                {menuLinks.map(({ to, label }) => (
                  <li key={to} className={pathname === to ? 'active' : ''}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-md-4">
              <h3>{t('footer.newsletter')}</h3>
              <form className="bottom_form" onSubmit={handleSubscribe}>
                <input
                  className="enter"
                  placeholder={t('footer.emailPlaceholder')}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="sub_btn">{t('footer.subscribe')}</button>
              </form>
              <ul className="social_icon">
                <li><a href="#"><i className="fa fa-facebook" aria-hidden="true"></i></a></li>
                <li><a href="#"><i className="fa fa-twitter" aria-hidden="true"></i></a></li>
                <li><a href="#"><i className="fa fa-linkedin" aria-hidden="true"></i></a></li>
                <li><a href="#"><i className="fa fa-youtube-play" aria-hidden="true"></i></a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="copyright">
          <div className="container">
            <div className="row">
              <div className="col-md-10 offset-md-1">
                <p>© {new Date().getFullYear()} Hotel Booking. {t('footer.rights')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
