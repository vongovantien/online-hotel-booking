import { useState, useEffect } from 'react';
import api from '../../../lib/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0, available: 0, rented: 0, maintenance: 0,
    totalBookings: 0, confirmed: 0, checkedIn: 0, cancelled: 0,
    totalRevenue: 0, monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          api.get('/rooms'),
          api.get('/bookings'),
        ]);

        const rooms = roomsRes.data || [];
        const bookings = bookingsRes.data || [];

        // Revenue from current month reports
        const now = new Date();
        let monthlyRevenue = 0;
        try {
          const revRes = await api.get('/reports/revenue', {
            params: { year: now.getFullYear(), month: now.getMonth() + 1 }
          });
          monthlyRevenue = (revRes.data || []).reduce((sum, item) => sum + Number(item.revenue || 0), 0);
        } catch { /* ignore */ }

        setStats({
          totalRooms: rooms.length,
          available: rooms.filter(r => r.status === 'AVAILABLE').length,
          rented: rooms.filter(r => r.status === 'RENTED').length,
          maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
          totalBookings: bookings.length,
          confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
          checkedIn: bookings.filter(b => b.status === 'CHECKED_IN').length,
          cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
          monthlyRevenue,
        });

        setRecentBookings(bookings.slice(-5).reverse());
      } catch (err) {
        console.error('Dashboard error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Tổng số phòng', value: stats.totalRooms, icon: '🏨', color: 'from-blue-600 to-blue-500', sub: `${stats.available} trống` },
    { label: 'Phòng đang thuê', value: stats.rented, icon: '🔑', color: 'from-amber-600 to-amber-500', sub: `${stats.maintenance} bảo trì` },
    { label: 'Đơn đặt phòng', value: stats.totalBookings, icon: '📋', color: 'from-violet-600 to-violet-500', sub: `${stats.confirmed} xác nhận` },
    { label: 'Doanh thu tháng', value: `${(stats.monthlyRevenue || 0).toLocaleString('vi-VN')} đ`, icon: '💰', color: 'from-emerald-600 to-emerald-500', sub: `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 animate-pulse">
        <span className="text-lg">Đang tải dữ liệu thống kê...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">📊 Tổng Quan Hệ Thống</h3>
        <p className="text-xs text-slate-500">Dashboard thời gian thực</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => (
          <div key={i} className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform`}>
                {card.icon}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{card.label}</span>
            </div>
            <div className="text-2xl font-black text-white">{card.value}</div>
            <div className="text-xs text-slate-500 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Occupancy Visual Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <h4 className="text-sm font-bold text-slate-300 mb-4">📈 Công suất phòng hiện tại</h4>
        <div className="space-y-3">
          {[
            { label: 'Đang thuê', count: stats.rented, total: stats.totalRooms, color: 'bg-amber-500' },
            { label: 'Trống', count: stats.available, total: stats.totalRooms, color: 'bg-emerald-500' },
            { label: 'Bảo trì', count: stats.maintenance, total: stats.totalRooms, color: 'bg-slate-600' },
          ].map((bar, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-slate-400 w-20 font-medium">{bar.label}</span>
              <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full ${bar.color} rounded-full transition-all duration-700`}
                  style={{ width: bar.total ? `${(bar.count / bar.total) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs text-white font-bold w-16 text-right">
                {bar.count}/{bar.total} ({bar.total ? ((bar.count / bar.total) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h4 className="text-sm font-bold text-slate-300">📋 Đơn đặt phòng gần nhất</h4>
        </div>
        {recentBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">Chưa có đơn đặt phòng nào.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Phòng</th>
                <th className="px-6 py-3 text-left">Khách</th>
                <th className="px-6 py-3 text-left">Check-in</th>
                <th className="px-6 py-3 text-left">Check-out</th>
                <th className="px-6 py-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {recentBookings.map((b, i) => {
                const statusColors = {
                  CONFIRMED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                  PENDING_PAYMENT: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                  CHECKED_IN: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                  CANCELLED: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
                };
                return (
                  <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-3 text-white font-bold">P.{b.roomNumber}</td>
                    <td className="px-6 py-3 text-slate-300">{b.guests?.[0]?.customerName || '—'}</td>
                    <td className="px-6 py-3 text-slate-400">{new Date(b.checkInDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-3 text-slate-400">{new Date(b.checkOutDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[b.status] || 'text-slate-400'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
