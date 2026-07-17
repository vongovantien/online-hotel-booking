import { useState, useEffect } from 'react';
import api from './lib/axios';
import stompClient from './lib/stompClient';

// Layout components
import Sidebar  from './components/Sidebar';
import StatsBar from './components/StatsBar';

// Feature modules (barrel imports)
import { LoginForm, RegisterForm } from './features/auth';
import { RoomSearch }              from './features/rooms';
import { CheckIn }                 from './features/checkin';
import { Checkout }                from './features/checkout';
import { MonthlyReports }          from './features/reports';
import { Settings }                from './features/settings';
import { AdminChatView }           from './features/chat';

function AccessDenied({ tab }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
      <div className="text-5xl mb-4">🔒</div>
      <p className="text-lg font-semibold">Không có quyền truy cập</p>
      <p className="text-sm mt-2">Tính năng &ldquo;{tab}&rdquo; chỉ dành cho Admin.</p>
    </div>
  );
}

export default function AdminApp() {
  const [token, setToken] = useState(
    () => localStorage.getItem('auth_token') || null
  );
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('auth_user')) || null;
    } catch {
      return null;
    }
  });

  const [authView, setAuthView]   = useState('login');
  const [activeTab, setActiveTab] = useState('rooms');
  const [roomsStats, setRoomsStats] = useState({ total: 15, available: 15, rented: 0 });
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  const updateStats = () => {
    if (!token) return;
    api.get('/rooms')
      .then((res) => {
        const data = res.data;
        setRoomsStats({
          total:     data.length,
          available: data.filter(r => r.status === 'AVAILABLE').length,
          rented:    data.filter(r => r.status === 'RENTED').length,
        });
      })
      .catch(() => {});
  };

  const updateChatNotifications = () => {
    if (!token || !user) return;
    if (user.role === 'RECEPTIONIST' || user.role === 'ADMIN') {
      api.get('/chat/rooms')
        .then(res => {
          const rooms = res.data || [];
          const unread = rooms.reduce((acc, r) => acc + (r.unreadAdminCount || 0), 0);
          setChatUnreadCount(unread);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    updateStats();
    updateChatNotifications();
    const timer = setInterval(() => {
      updateStats();
    }, 10000); // reduced frequency since chat alerts are now real-time

    let sub = null;
    if (token && user && (user.role === 'RECEPTIONIST' || user.role === 'ADMIN')) {
      sub = stompClient.subscribe('/topic/admin/chat-alerts', () => {
        updateChatNotifications();
      });
    }

    return () => {
      clearInterval(timer);
      if (sub) sub.unsubscribe();
    };
  }, [token, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoginSuccess = ({ token: newToken, user: newUser }) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setToken(null);
      setUser(null);
      setActiveTab('rooms');
    }
  };

  const getVisibleTabs = () => {
    if (!user) return [];
    const tabs = [{ key: 'rooms', label: '🏨 Tra Cứu Phòng', icon: '🔑', desc: 'BM3' }];
    if (user.role === 'RECEPTIONIST' || user.role === 'ADMIN') {
      tabs.push({ key: 'checkin',  label: '📝 Lập Phiếu Thuê', icon: '🖊️',  desc: 'BM2' });
      tabs.push({ key: 'checkout', label: '💳 Thanh Toán',      icon: '💰',  desc: 'BM4' });
      tabs.push({
        key: 'chat',
        label: chatUnreadCount > 0 ? `💬 Live Chat (${chatUnreadCount})` : '💬 Live Chat CSKH',
        icon: '💬',
        desc: chatUnreadCount > 0 ? `+${chatUnreadCount} Mới` : '24/7'
      });
    }
    if (user.role === 'ADMIN') {
      tabs.push({ key: 'reports',  label: '📊 Báo Cáo Tháng',   icon: '📈',  desc: 'BM5' });
      tabs.push({ key: 'settings', label: '⚙️ Cấu Hình Quy Định', icon: '🛠️', desc: 'QĐ6' });
    }
    return tabs;
  };

  // ─── Auth Screen ─────────────────────────────────────────────────────────────
  if (!token || !user) {
    return (
      <div className="admin-root min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4">
        <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-amber-500/20 mb-4">
              H
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">HOTELIFY PORTAL</h2>
            <p className="text-xs text-slate-400 mt-1">Đăng nhập để vào trang quản trị khách sạn</p>
          </div>

          <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80">
            {['login', 'register'].map(v => (
              <button
                key={v}
                onClick={() => setAuthView(v)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  authView === v
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {v === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
              </button>
            ))}
          </div>

          {authView === 'login'
            ? <LoginForm onLoginSuccess={handleLoginSuccess} />
            : <RegisterForm onRegisterSuccess={() => setAuthView('login')} />}
        </div>
      </div>
    );
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-root min-h-screen bg-slate-950 flex text-slate-200">
      <Sidebar
        tabs={getVisibleTabs()}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <StatsBar activeTab={activeTab} stats={roomsStats} />
        <main className="flex-grow p-8">
          {activeTab === 'rooms'    && <RoomSearch />}
          {activeTab === 'checkin'  && <CheckIn />}
          {activeTab === 'checkout' && <Checkout />}
          {activeTab === 'chat'     && <AdminChatView user={user} />}
          {activeTab === 'reports'  && (user?.role === 'ADMIN'
            ? <MonthlyReports />
            : <AccessDenied tab="reports" />)}
          {activeTab === 'settings' && (user?.role === 'ADMIN'
            ? <Settings />
            : <AccessDenied tab="settings" />)}
        </main>
      </div>
    </div>
  );
}

