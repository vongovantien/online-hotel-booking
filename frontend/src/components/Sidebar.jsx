export default function Sidebar({ tabs, activeTab, onTabChange, user, onLogout }) {
  return (
    <aside className="w-72 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between p-6 shrink-0 sticky top-0 h-screen">
      <div className="space-y-8">
        {/* Logo Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-500/30">
            H
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest text-white">
              HOTELIFY
            </h1>
            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
              Dashboard Portal
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label.substring(2)}</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-950/60 opacity-60 text-slate-400 font-bold">
                {tab.desc}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer - Profile Account Card */}
      <div className="border-t border-slate-800/80 pt-6 space-y-4">
        <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">
              {user.username}
            </div>
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              {user.role}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full py-3 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <span>🚪</span> Đăng Xuất Hệ Thống
        </button>
      </div>
    </aside>
  );
}
