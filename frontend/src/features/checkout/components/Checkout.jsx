import { useState, useEffect } from 'react';
import api from '../../../lib/axios';

export default function Checkout() {
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/rooms', { params: { status: 'RENTED' } })
      .then((r) => setRooms(r.data))
      .catch(() => {});
  }, [invoice]);

  const toggleRoom = (roomId) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleCheckout = async () => {
    setError('');
    setInvoice(null);
    if (!customerName || customerName.trim().length === 0) {
      setError('Tên Khách hàng / Cơ quan thanh toán không được để trống.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/invoices/checkout', {
        customerOrgName: customerName,
        address,
        roomIds: selectedRooms,
      });
      setInvoice(res.data);
      setSelectedRooms([]);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {invoice && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <h3 className="text-lg font-bold text-emerald-400">
              ✅ HÓA ĐƠN THANH TOÁN THÀNH CÔNG
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
              Đã Thanh Toán
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Khách hàng / Cơ quan:</span>{' '}
              <span className="text-white font-bold block mt-0.5">
                {invoice.customerOrgName}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Địa chỉ:</span>{' '}
              <span className="text-white font-medium block mt-0.5">
                {invoice.address || '—'}
              </span>
            </div>
          </div>

          {invoice.details && (
            <div className="overflow-hidden border border-slate-800 rounded-xl mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider text-left border-b border-slate-800">
                    <th className="px-4 py-3">Phòng</th>
                    <th className="px-4 py-3">Loại</th>
                    <th className="px-4 py-3 text-right">Số ngày</th>
                    <th className="px-4 py-3 text-right">Đơn giá</th>
                    <th className="px-4 py-3 text-right">Phụ thu</th>
                    <th className="px-4 py-3 text-right">HS Nước ngoài</th>
                    <th className="px-4 py-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.details.map((d, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-850 hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-white font-black">
                        P.{d.roomNumber}
                      </td>
                      <td className="px-4 py-3">Loại {d.roomTypeName}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {d.totalDays}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {Number(d.basePriceSnapshot).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(d.surchargeRatioApplied * 100).toFixed(0)}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        x{d.coefficientApplied}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-400 font-bold">
                        {Number(d.subTotal).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20">
            <span className="text-slate-400 font-bold text-sm">
              TỔNG TRỊ GIÁ THANH TOÁN:
            </span>
            <span className="text-2xl font-black text-amber-400">
              {Number(invoice.totalAmount).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-sm">
          ❌ {error}
        </div>
      )}

      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 space-y-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Tên Khách hàng / Cơ quan thanh toán *
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nguyễn Văn A / Công ty Vietravel"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Địa chỉ khách hàng
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="190 Pasteur, Quận 3, HCM"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Chọn phòng đang thuê để thanh toán
          </label>
          {rooms.length === 0 ? (
            <p className="text-slate-500 text-sm italic">
              Hiện tại không có phòng nào đang được thuê.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => toggleRoom(r.id)}
                  className={`p-5 rounded-2xl border text-left transition-all duration-200 ${
                    selectedRooms.includes(r.id)
                      ? 'bg-amber-600/10 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-2xl font-black">P.{r.roomNumber}</div>
                  <div className="text-xs text-slate-500 mt-2 font-bold">
                    Loại {r.roomTypeName} —{' '}
                    {Number(r.price || r.basePrice || 0).toLocaleString('vi-VN')} đ/đêm
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading || selectedRooms.length === 0}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-lg transition-all duration-300 shadow-lg shadow-emerald-500/20"
        >
          {loading
            ? 'Đang xử lý hóa đơn...'
            : `💳 THANH TOÁN HÓA ĐƠN (${selectedRooms.length} phòng)`}
        </button>
      </div>
    </div>
  );
}
