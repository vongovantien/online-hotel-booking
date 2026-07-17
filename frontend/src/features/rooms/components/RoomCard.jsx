export default function RoomCard({ room, onEdit, onDelete }) {
  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden hover:border-slate-700/80 transition-all hover:-translate-y-1 duration-300 shadow-xl flex flex-col justify-between">
      {/* Card Header Info */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            Phòng {room.roomTypeName}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              room.status === 'AVAILABLE'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {room.status === 'AVAILABLE' ? '✅ Trống' : '🔒 Đang thuê'}
          </span>
        </div>

        <div>
          <h4 className="text-3xl font-black text-white">P.{room.roomNumber}</h4>
          <p className="text-xs text-slate-500 mt-1 italic">
            Ghi chú: {room.note || 'Không có ghi chú'}
          </p>
        </div>
      </div>

      {/* Card Footer Price & Actions */}
      <div className="border-t border-slate-800/60 px-6 py-4 bg-slate-900/30 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Đơn giá
          </span>
          <span className="text-base font-black text-amber-400">
            {Number(room.price || room.basePrice || 0).toLocaleString('vi-VN')} đ
            <span className="text-xs text-slate-500 font-normal">/đêm</span>
          </span>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(room)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700"
                title="Sửa phòng"
              >
                ✏️ Sửa
              </button>
            )}
            {onDelete && room.status !== 'RENTED' && (
              <button
                onClick={() => onDelete(room)}
                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition-colors"
                title="Xóa phòng"
              >
                🗑️ Xóa
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
