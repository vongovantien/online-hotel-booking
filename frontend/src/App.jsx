import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';

// ─── Customer site
import { AuthProvider }    from './customer/context/AuthContext';
import CustomerLayout      from './customer/components/CustomerLayout';
import HomePage            from './customer/pages/HomePage';
import RoomsPage           from './customer/pages/RoomsPage';
import AboutPage           from './customer/pages/AboutPage';
import ContactPage         from './customer/pages/ContactPage';
import GalleryPage         from './customer/pages/GalleryPage';
import LoginPage           from './customer/pages/LoginPage';
import RegisterPage        from './customer/pages/RegisterPage';
import ProtectedRoute      from './customer/components/ProtectedRoute';
import MyBookingsPage      from './customer/pages/MyBookingsPage';
import ProfilePage         from './customer/pages/ProfilePage';
import PaymentSuccessPage  from './customer/pages/PaymentSuccessPage';

// ─── Admin dashboard
import AdminApp from './AdminApp';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Admin: Tailwind dark theme, no keto CSS, own auth state ── */}
            <Route path="/admin/*" element={<AdminApp />} />

            {/* ── Customer: keto CSS injected by CustomerLayout ── */}
            <Route
              path="/*"
              element={
                <Routes>
                  <Route element={<CustomerLayout />}>
                    <Route index          element={<HomePage />} />
                    <Route path="about"   element={<AboutPage />} />
                    <Route path="rooms"   element={<RoomsPage />} />
                    <Route path="gallery" element={<GalleryPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="login"   element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="my-bookings" element={<MyBookingsPage />} />
                      <Route path="profile"     element={<ProfilePage />} />
                      <Route path="payment-success" element={<PaymentSuccessPage />} />
                    </Route>
                    <Route path="*"       element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
