import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Loader from './Loader';
import CustomerChatBox from './CustomerChatBox';
import ScrollToTop from './ScrollToTop';
import { useAuth } from '../context/AuthContext';
import StaffBanner from './StaffBanner';

const KETO_CSS = [
  'https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css',
  '/keto-css/bootstrap.min.css',
  '/keto-css/style.css',
  '/keto-css/responsive.css',
];

// Undo Tailwind preflight conflicts with Bootstrap/keto styles
const KETO_RESET = `
  .main-layout *, .main-layout *::before, .main-layout *::after { box-sizing: border-box; }
  .main-layout body, .main-layout { font-family: 'Poppins', sans-serif !important; background-color: #fff !important; color: #666 !important; }
  .main-layout img { max-width: 100%; height: auto; }
  .main-layout ul, .main-layout ol { list-style: none; margin: 0; padding: 0; }
  .main-layout h1,.main-layout h2,.main-layout h3,.main-layout h4,.main-layout h5,.main-layout h6 { margin: 0; padding: 0 0 10px 0; }
  /* Ensure Bootstrap grid works without Tailwind interference */
  .main-layout .container { max-width: 1170px; margin: 0 auto; padding: 0 15px; }
  .main-layout .row { display: flex !important; flex-wrap: wrap !important; margin: 0 -15px; }
  .main-layout [class*="col-"] { padding: 0 15px; }
  /* Fix inputs losing default styles */
  .main-layout input, .main-layout textarea, .main-layout select { font-family: inherit; }
`;

export default function CustomerLayout() {
  const { user } = useAuth();

  useEffect(() => {
    const resetEl = document.createElement('style');
    resetEl.setAttribute('data-keto', 'true');
    resetEl.textContent = KETO_RESET;
    document.head.appendChild(resetEl);

    const links = KETO_CSS.map(href => {
      const el = document.createElement('link');
      el.rel  = 'stylesheet';
      el.href = href;
      el.setAttribute('data-keto', 'true');
      document.head.appendChild(el);
      return el;
    });

    const prevClass = document.body.className;
    const prevBg    = document.body.style.backgroundColor;
    const prevColor = document.body.style.color;
    const prevFont  = document.body.style.fontFamily;

    document.body.className = 'main-layout';
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
    document.body.style.fontFamily = '';

    return () => {
      [resetEl, ...links].forEach(el => el.parentNode?.removeChild(el));
      document.body.className = prevClass;
      document.body.style.backgroundColor = prevBg;
      document.body.style.color = prevColor;
      document.body.style.fontFamily = prevFont;
    };
  }, []);

  return (
    <>
      <StaffBanner />
      <div style={{
        paddingTop: (user?.role === 'RECEPTIONIST' || user?.role === 'ADMIN') ? '48px' : 0
      }}>
        <ScrollToTop />
        <Loader />
        <Navbar />
        <Outlet />
        <Footer />
        <CustomerChatBox />
      </div>
    </>
  );
}
