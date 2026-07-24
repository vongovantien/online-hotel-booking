import { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import { setCookie } from '../../../lib/cookie';

export default function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Real-time validation
  useEffect(() => {
    const errors = {};
    if (username && username.trim().length === 0) {
      errors.username = 'Tên đăng nhập không được để trống';
    }
    if (password && password.length === 0) {
      errors.password = 'Mật khẩu không được để trống';
    }
    setFieldErrors(errors);
  }, [username, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        usernameOrEmail: username,
        password,
      });
      const data = res.data;
      setCookie('auth_token', data.token);
      localStorage.setItem(
        'auth_user',
        JSON.stringify({
          username: data.username,
          role: data.role,
          userId: data.userId,
        })
      );
      onLoginSuccess({
        token: data.token,
        user: { username: data.username, role: data.role, userId: data.userId },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Tên đăng nhập hoặc mật khẩu không chính xác.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Tên đăng nhập hoặc Email
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin / receptionist / customer"
          className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Mật khẩu
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu của bạn"
          className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading || Object.keys(fieldErrors).length > 0}
        className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Đang xác thực...' : '🔒 Đăng Nhập'}
      </button>

      <div className="text-center pt-2">
        <span className="text-xs text-slate-500">
          Tài khoản demo: admin / Admin@123
        </span>
      </div>
    </form>
  );
}
