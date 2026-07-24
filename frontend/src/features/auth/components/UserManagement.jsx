import { useState, useEffect } from 'react';
import api from '../../../lib/axios';

const ROLE_COLORS = {
  ADMIN:        'text-rose-400 bg-rose-500/10 border-rose-500/30',
  RECEPTIONIST: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  CUSTOMER:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const ROLE_LABELS = {
  ADMIN: '🔴 Admin',
  RECEPTIONIST: '🔵 Lễ tân',
  CUSTOMER: '🟢 Khách hàng',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data || []);
    } catch {
      alert('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Bạn muốn đổi vai trò người dùng thành ${ROLE_LABELS[newRole] || newRole}?`)) return;
    try {
      await api.put(`/auth/users/${userId}/role`, null, { params: { role: newRole } });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật vai trò.');
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Xóa vĩnh viễn tài khoản "${username}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa người dùng.');
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return u.username?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
    }
    return true;
  });

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    receptionist: users.filter(u => u.role === 'RECEPTIONIST').length,
    customer: users.filter(u => u.role === 'CUSTOMER').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 animate-pulse">
        <span className="text-lg">Đang tải danh sách người dùng...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">👥 Quản Lý Người Dùng</h3>
        <p className="text-xs text-slate-500">Quản lý tài khoản, phân quyền vai trò</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng cộng', value: stats.total, icon: '👥', color: 'from-slate-600 to-slate-500' },
          { label: 'Admin', value: stats.admin, icon: '🔴', color: 'from-rose-600 to-rose-500' },
          { label: 'Lễ tân', value: stats.receptionist, icon: '🔵', color: 'from-blue-600 to-blue-500' },
          { label: 'Khách hàng', value: stats.customer, icon: '🟢', color: 'from-emerald-600 to-emerald-500' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-black text-white">{s.value}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo username hoặc email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 placeholder-slate-600"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
        >
          <option value="">Tất cả vai trò</option>
          <option value="ADMIN">Admin</option>
          <option value="RECEPTIONIST">Lễ tân</option>
          <option value="CUSTOMER">Khách hàng</option>
        </select>
      </div>

      {/* User Table */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">Không tìm thấy người dùng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="px-5 py-3 text-left">Username</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Vai trò</th>
                  <th className="px-5 py-3 text-left">Ngày tạo</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-3 text-white font-bold">{user.username}</td>
                    <td className="px-5 py-3 text-slate-300">{user.email || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${ROLE_COLORS[user.role] || 'text-slate-400'}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none focus:border-amber-500"
                        >
                          <option value="CUSTOMER">Khách hàng</option>
                          <option value="RECEPTIONIST">Lễ tân</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 hover:border-rose-500 rounded-lg text-xs font-bold transition-all"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
