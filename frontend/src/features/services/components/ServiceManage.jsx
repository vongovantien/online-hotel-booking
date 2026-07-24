import { useState, useEffect } from 'react';
import api from '../../../lib/axios';

export default function ServiceManage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [editingService, setEditingService] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      setError('Không thể tải danh sách dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleResetForm = () => {
    setEditingService(null);
    setServiceName('');
    setPrice('');
    setUnit('');
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setServiceName(service.serviceName);
    setPrice(service.price.toString());
    setUnit(service.unit);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!serviceName || !price || !unit) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      const payload = { serviceName, price: parseFloat(price), unit };
      if (editingService) {
        await api.put(`/services/${editingService.id}`, payload);
        setSuccess('Cập nhật dịch vụ thành công!');
      } else {
        await api.post('/services', payload);
        setSuccess('Thêm dịch vụ mới thành công!');
      }
      handleResetForm();
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin dịch vụ.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/services/${id}`);
      setSuccess('Xóa dịch vụ thành công!');
      fetchServices();
    } catch (err) {
      setError('Không thể xóa dịch vụ này.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form column */}
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/80 shadow-2xl h-fit">
        <h3 className="text-xl font-bold text-white mb-2">
          {editingService ? '✏️ Chỉnh sửa dịch vụ' : '➕ Thêm dịch vụ mới'}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {editingService ? 'Cập nhật lại đơn giá hoặc đơn vị tính dịch vụ' : 'Đăng ký danh mục dịch vụ phát sinh cho khách sạn'}
        </p>

        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl mb-4 font-bold">❌ {error}</div>}
        {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl mb-4 font-bold">✅ {success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-2">Tên Dịch Vụ / Service Name</label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Ví dụ: Coca Cola, Giặt quần áo..."
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-2">Đơn Giá (đ) / Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ví dụ: 20000"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-2">Đơn Vị Tính / Unit</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Ví dụ: Lon, Lượt, Đĩa..."
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-grow py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl text-sm hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-650/20"
            >
              {editingService ? 'Cập nhật' : 'Lưu dịch vụ'}
            </button>
            {editingService && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List column */}
      <div className="lg:col-span-2 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white">📋 Danh sách dịch vụ hiện có</h3>
          <p className="text-xs text-slate-400 mt-1">Danh mục dịch vụ đi kèm có thể ghi nhận tại khách sạn</p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 italic">⏳ Đang tải danh sách dịch vụ...</div>
        ) : services.length === 0 ? (
          <div className="py-20 text-center text-slate-500 italic">Chưa có dịch vụ nào được cấu hình.</div>
        ) : (
          <div className="overflow-hidden border border-slate-800 rounded-2xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-850 text-slate-400 text-xs font-bold text-left">
                  <th className="px-5 py-3">Tên dịch vụ</th>
                  <th className="px-5 py-3">Đơn giá</th>
                  <th className="px-5 py-3">Đơn vị</th>
                  <th className="px-5 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-slate-850 hover:bg-slate-900/10 transition-colors">
                    <td className="px-5 py-4 font-bold text-white text-sm">{service.serviceName}</td>
                    <td className="px-5 py-4 text-slate-300 font-mono text-sm">
                      {Number(service.price).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{service.unit}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500 border border-blue-500/20 text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-all"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white rounded-lg text-xs font-bold transition-all"
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
