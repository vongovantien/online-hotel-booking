import { useState, useEffect } from 'react';
import api from '../../../lib/axios';

const EMPTY_CUSTOMER = {
  customerName: '',
  customerType: 'DOMESTIC',
  idCard: '',
  address: '',
};

export default function CheckIn() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [customers, setCustomers] = useState([{ ...EMPTY_CUSTOMER }]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [errorsMap, setErrorsMap] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchRooms = () => {
    api
      .get('/rooms', { params: { status: 'AVAILABLE' } })
      .then((r) => setRooms(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchRooms();
  }, [result]);

  const addCustomer = () => {
    if (customers.length >= 3) {
      setError('Số lượng khách không vượt quá 3 người theo quy định.');
      return;
    }
    setError('');
    setCustomers([...customers, { ...EMPTY_CUSTOMER }]);
  };

  const removeCustomer = (index) => {
    setCustomers(customers.filter((_, i) => i !== index));
    setError('');
  };

  const updateCustomer = (index, field, value) => {
    if (field === 'idCard' && !/^[a-zA-Z0-9]*$/.test(value)) return;
    const updated = [...customers];
    updated[index] = { ...updated[index], [field]: value };
    setCustomers(updated);
  };

  const handleSubmit = async () => {
    setError('');
    setErrorsMap({});
    setResult(null);

    const fieldErrors = {};
    customers.forEach((c, idx) => {
      if (!c.customerName || c.customerName.trim().length === 0) {
        fieldErrors[`name_${idx}`] = 'Tên không được để trống';
      }
      if (!c.idCard || c.idCard.trim().length === 0) {
        fieldErrors[`id_${idx}`] = 'Số CMND không được để trống';
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrorsMap(fieldErrors);
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/rentals', {
        roomId: selectedRoom,
        startDate: new Date().toISOString(),
        customers,
      });
      setResult(res.data);
      setCustomers([{ ...EMPTY_CUSTOMER }]);
      setSelectedRoom('');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrorsMap(err.response.data.errors);
        setError('Dữ liệu nhập vào không hợp lệ.');
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {result && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
          ✅ Đã lập phiếu thuê phòng {result.room?.roomNumber} thành công! (Mã
          phiếu: {result.id?.substring(0, 8)}...)
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-sm">
          ❌ {error}
        </div>
      )}

      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 space-y-6 shadow-2xl">
        {/* Room Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Chọn Phòng Trống *
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
          >
            <option value="">-- Chọn phòng --</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Phòng {r.roomNumber} — Loại {r.roomTypeName} —{' '}
                {Number(r.price || r.basePrice || 0).toLocaleString('vi-VN')} đ/đêm
              </option>
            ))}
          </select>
        </div>

        {/* Customer list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Thông tin khách thuê (Tối đa 3 khách)
            </label>
            {customers.length < 3 && (
              <button
                onClick={addCustomer}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
              >
                + Thêm khách
              </button>
            )}
          </div>

          <div className="space-y-4">
            {customers.map((c, i) => (
              <div
                key={i}
                className="bg-slate-950/40 rounded-2xl p-4 border border-slate-850 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                    Khách thuê #{i + 1}
                  </span>
                  {customers.length > 1 && (
                    <button
                      onClick={() => removeCustomer(i)}
                      className="text-rose-400 hover:text-rose-350 text-xs font-bold"
                    >
                      ✕ Xóa
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                      Họ và tên *
                    </label>
                    <input
                      placeholder="Nguyễn Văn A"
                      value={c.customerName}
                      onChange={(e) =>
                        updateCustomer(i, 'customerName', e.target.value)
                      }
                      className={inputCls}
                    />
                    {errorsMap[`name_${i}`] && (
                      <span className="text-rose-400 text-[10px] mt-1 block">
                        {errorsMap[`name_${i}`]}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                      Loại khách
                    </label>
                    <select
                      value={c.customerType}
                      onChange={(e) =>
                        updateCustomer(i, 'customerType', e.target.value)
                      }
                      className={inputCls}
                    >
                      <option value="DOMESTIC">Nội địa</option>
                      <option value="FOREIGN">Nước ngoài</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                      Số CMND / Passport *
                    </label>
                    <input
                      placeholder="CMND (Chỉ nhập chữ và số)"
                      value={c.idCard}
                      onChange={(e) =>
                        updateCustomer(i, 'idCard', e.target.value)
                      }
                      className={inputCls}
                    />
                    {errorsMap[`id_${i}`] && (
                      <span className="text-rose-400 text-[10px] mt-1 block">
                        {errorsMap[`id_${i}`]}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                      Địa chỉ
                    </label>
                    <input
                      placeholder="Địa chỉ liên hệ"
                      value={c.address}
                      onChange={(e) =>
                        updateCustomer(i, 'address', e.target.value)
                      }
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !selectedRoom}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-lg transition-all duration-300 shadow-lg shadow-amber-500/20"
        >
          {loading ? 'Đang lập phiếu...' : '📝 LẬP PHIẾU THUÊ PHÒNG'}
        </button>
      </div>
    </div>
  );
}
