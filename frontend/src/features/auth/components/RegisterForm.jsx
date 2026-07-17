import { useState, useEffect } from 'react';
import api from '../../../lib/axios';

export default function RegisterForm({ onRegisterSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time validation
  useEffect(() => {
    const errs = {};

    if (username && username.length < 3) {
      errs.username = 'Tên đăng nhập phải chứa ít nhất 3 ký tự';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errs.email = 'Định dạng email không hợp lệ';
    }

    if (password) {
      if (password.length < 8) {
        errs.password = 'Mật khẩu phải chứa ít nhất 8 ký tự';
      } else if (!/[A-Z]/.test(password)) {
        errs.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa';
      } else if (!/[0-9]/.test(password)) {
        errs.password = 'Mật khẩu phải chứa ít nhất 1 chữ số';
      } else if (!/[^a-zA-Z0-9]/.test(password)) {
        errs.password =
          'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (VD: @, #, $, ...)';
      }
    }

    if (confirmPassword && password !== confirmPassword) {
      errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(errs);
  }, [username, email, password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess('');

    if (
      Object.keys(errors).length > 0 ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setSubmitError('Vui lòng sửa các lỗi nhập liệu trước khi đăng ký.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password, role });
      setSuccess(
        'Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...'
      );
      setTimeout(() => {
        onRegisterSuccess();
      }, 2000);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          err.response?.data?.errors?.password ||
          'Đăng ký thất bại.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
          {success}
        </div>
      )}
      {submitError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {submitError}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Tên đăng nhập
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="nhap_ten_dang_nhap"
          className={inputCls}
        />
        {errors.username && (
          <span className="text-rose-400 text-[10px] block mt-1">
            {errors.username}
          </span>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Email
        </label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className={inputCls}
        />
        {errors.email && (
          <span className="text-rose-400 text-[10px] block mt-1">
            {errors.email}
          </span>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Mật khẩu
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Chứa chữ hoa, chữ số & ký tự đặc biệt"
          className={inputCls}
        />
        {errors.password && (
          <span className="text-rose-400 text-[10px] block mt-1 leading-normal">
            {errors.password}
          </span>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Nhập lại mật khẩu
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Xác nhận lại mật khẩu"
          className={inputCls}
        />
        {errors.confirmPassword && (
          <span className="text-rose-400 text-[10px] block mt-1">
            {errors.confirmPassword}
          </span>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Vai trò đăng ký
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
        >
          <option value="CUSTOMER">👤 Khách hàng (Customer)</option>
          <option value="RECEPTIONIST">🛎️ Lễ tân (Receptionist)</option>
          <option value="ADMIN">👑 Quản trị viên (Admin)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={
          loading ||
          Object.keys(errors).length > 0 ||
          !username ||
          !email ||
          !password ||
          !confirmPassword
        }
        className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Đang tạo tài khoản...' : '✨ Đăng Ký Tài Khoản'}
      </button>
    </form>
  );
}
