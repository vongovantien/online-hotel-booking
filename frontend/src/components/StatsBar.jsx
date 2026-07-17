import { useLanguage } from '../context/LanguageContext';

const TAB_TITLES = {
  vi: {
    rooms: 'Tra cứu danh mục phòng',
    checkin: 'Lập phiếu thuê phòng',
    checkout: 'Lập hóa đơn thanh toán',
    reports: 'Báo cáo tổng kết doanh thu',
    settings: 'Cấu hình quy định khách sạn',
  },
  en: {
    rooms: 'Room Directory & Lookup',
    checkin: 'Create Rental Voucher',
    checkout: 'Checkout & Invoice',
    reports: 'Monthly Revenue Reports',
    settings: 'Hotel System Settings',
  }
};

export default function StatsBar({ activeTab, stats }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="border-b border-slate-800/60 bg-slate-900/20 px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {lang === 'vi' ? 'Hệ thống quản lý' : 'Management System'}
          </p>
          <h2 className="text-2xl font-black text-white capitalize">
            {TAB_TITLES[lang]?.[activeTab] || TAB_TITLES['vi'][activeTab] || ''}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Chuyển ngôn ngữ / Switch language"
          >
            <span>{lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
            <span className="text-slate-500">⇄</span>
          </button>
          <div className="text-xs text-slate-500 font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            {lang === 'vi' ? 'Cập nhật lúc: ' : 'Updated: '}{new Date().toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US')}
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {t('admin.stats.total')}
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {stats.total}
            </div>
          </div>
          <span className="text-2xl">🏨</span>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {t('admin.stats.available')}
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {stats.available}
            </div>
          </div>
          <span className="text-2xl">✅</span>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {t('admin.stats.rented')}
            </span>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {stats.rented}
            </div>
          </div>
          <span className="text-2xl">🔒</span>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {lang === 'vi' ? 'Hiệu suất phòng' : 'Occupancy Rate'}
            </span>
            <div className="text-2xl font-black text-indigo-400 mt-1">
              {((stats.rented / (stats.total || 1)) * 100).toFixed(0)}%
            </div>
          </div>
          <span className="text-2xl">📊</span>
        </div>
      </div>
    </header>
  );
}
