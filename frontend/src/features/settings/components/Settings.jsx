import { useState, useEffect } from 'react';
import api from '../../../lib/axios';

export default function Settings() {
  const [params, setParams] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editPrices, setEditPrices] = useState({});
  const [editValues, setEditValues] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [resParams, resTypes] = await Promise.all([
        api.get('/parameters'),
        api.get('/room-types'),
      ]);
      setParams(resParams.data);
      setRoomTypes(resTypes.data);

      const initialValues = {};
      resParams.data.forEach((p) => {
        initialValues[p.paramKey] = p.paramValue;
      });
      setEditValues(initialValues);

      const initialPrices = {};
      resTypes.data.forEach((t) => {
        initialPrices[t.id] = t.basePrice;
      });
      setEditPrices(initialPrices);
    } catch (err) {
      console.error('Lỗi tải cấu hình:', err);
      setError('Lỗi tải cấu hình.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateParam = async (key) => {
    setMessage('');
    setError('');
    try {
      await api.put('/parameters', {
        paramKey: key,
        paramValue: editValues[key],
      });
      setMessage(`Cập nhật tham số ${key} thành công!`);
      fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleUpdatePrice = async (id, name) => {
    setMessage('');
    setError('');
    try {
      await api.put(`/room-types/${id}`, {
        basePrice: editPrices[id],
      });
      setMessage(`Cập nhật đơn giá phòng loại ${name} thành công!`);
      fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (loading && params.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">
        Đang tải cấu hình hệ thống...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
          ✅ {message}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-sm">
          ❌ {error}
        </div>
      )}

      {/* Parameters configuration */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 space-y-4 shadow-xl">
        <h3 className="text-md font-bold text-amber-500 border-b border-slate-800 pb-3 flex items-center gap-2">
          <span>⚙️</span> Quy Định Hệ Thống (Sức chứa & Phụ thu)
        </h3>
        <div className="space-y-4">
          {params.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-slate-850"
            >
              <div className="flex-1 pr-4">
                <div className="font-bold text-white text-sm">
                  {p.paramKey}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {p.description}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.01"
                  value={editValues[p.paramKey] || ''}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      [p.paramKey]: e.target.value,
                    })
                  }
                  className="w-28 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-semibold text-right focus:outline-none focus:border-amber-500 text-sm"
                />
                <button
                  onClick={() => handleUpdateParam(p.paramKey)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room base price configuration */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 space-y-4 shadow-xl">
        <h3 className="text-md font-bold text-indigo-400 border-b border-slate-800 pb-3 flex items-center gap-2">
          <span>💵</span> Bảng Giá Loại Phòng (Danh mục đơn giá)
        </h3>
        <div className="space-y-4">
          {roomTypes.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-slate-850"
            >
              <div className="flex-1">
                <div className="font-bold text-white text-sm">
                  Loại Phòng {t.typeName}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {t.description || 'Không có mô tả'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="number"
                    value={editPrices[t.id] || ''}
                    onChange={(e) =>
                      setEditPrices({
                        ...editPrices,
                        [t.id]: e.target.value,
                      })
                    }
                    className="w-36 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold text-right focus:outline-none focus:border-indigo-500 text-sm pr-7"
                  />
                  <span className="absolute right-2 top-2 text-xs text-slate-500 font-bold">
                    đ
                  </span>
                </div>
                <button
                  onClick={() => handleUpdatePrice(t.id, t.typeName)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
