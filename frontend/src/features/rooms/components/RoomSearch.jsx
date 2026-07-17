import { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import RoomCard from './RoomCard';

export default function RoomSearch() {
  const [rooms, setRooms] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal Thêm/Sửa
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomTypeName: 'A',
    status: 'AVAILABLE',
    note: ''
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/rooms', { params });
      setRooms(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [typeFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      roomTypeName: 'A',
      status: 'AVAILABLE',
      note: ''
    });
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber || '',
      roomTypeName: room.roomTypeName || 'A',
      status: room.status || 'AVAILABLE',
      note: room.note || ''
    });
    setModalError('');
    setShowModal(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!formData.roomNumber.trim()) {
      setModalError('Vui lòng nhập số phòng!');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, formData);
      } else {
        await api.post('/rooms', formData);
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Lỗi khi lưu thông tin phòng');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng P.${room.roomNumber} không?`)) return;
    try {
      await api.delete(`/rooms/${room.id}`);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa phòng này (có thể phòng đang hoặc đã có khách thuê).');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🏨</span> Quản lý & Tra cứu danh mục phòng
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tìm kiếm, thêm mới, chỉnh sửa thông tin hoặc xóa phòng khách sạn
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors cursor-pointer text-slate-200"
          >
            <option value="">Tất cả loại phòng</option>
            <option value="A">Loại A</option>
            <option value="B">Loại B</option>
            <option value="C">Loại C</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors cursor-pointer text-slate-200"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="AVAILABLE">Trống (AVAILABLE)</option>
            <option value="RENTED">Đang thuê (RENTED)</option>
          </select>
          <button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <span>➕</span> Thêm Phòng Mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 animate-pulse font-medium">
          Đang tải danh sách phòng...
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          Không tìm thấy phòng nào phù hợp bộ lọc.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteRoom}
            />
          ))}
        </div>
      )}

      {/* Modal Thêm / Sửa Phòng */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{editingRoom ? '✏️ Cập Nhật Phòng' : '➕ Thêm Phòng Mới'}</span>
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-white text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center bg-slate-800"
              >
                ×
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Số phòng (*)
                </label>
                <input
                  type="text"
                  placeholder="VD: 101, 202, 305..."
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Loại phòng (*)
                </label>
                <select
                  value={formData.roomTypeName}
                  onChange={(e) => setFormData({ ...formData, roomTypeName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="A">Loại A (Đơn giá chuẩn / Cao cấp)</option>
                  <option value="B">Loại B (Đơn giá tiêu chuẩn)</option>
                  <option value="C">Loại C (Đơn giá tiết kiệm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="AVAILABLE">AVAILABLE (Sẵn sàng cho thuê)</option>
                  <option value="RENTED">RENTED (Đang có khách thuê)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Ghi chú / Đặc điểm
                </label>
                <textarea
                  placeholder="VD: Phòng góc có view biển, ban công rộng, yên tĩnh..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows="3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {modalLoading ? 'Đang lưu...' : editingRoom ? 'Cập Nhật' : 'Tạo Phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
