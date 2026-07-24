import { useState, useEffect } from 'react';
import api from '../../../lib/axios';

export default function RoomTimelineScheduler() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Date selection (default to current year and month)
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-indexed

  // Detailed view popup state
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Active rental & services states (Phase 2)
  const [activeRental, setActiveRental] = useState(null);
  const [rentalServices, setRentalServices] = useState([]);
  const [serviceCatalog, setServiceCatalog] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState(1);

  const fetchRoomsAndBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const roomsRes = await api.get('/rooms');
      setRooms(roomsRes.data);

      const bookingsRes = await api.get('/bookings');
      setBookings(bookingsRes.data);
    } catch (err) {
      setError('Không thể tải thông tin lịch đặt phòng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndBookings();
  }, []);

  useEffect(() => {
    if (selectedBooking && selectedBooking.status === 'CHECKED_IN') {
      api.get(`/rooms/${selectedBooking.roomId}/active-rental`)
        .then(res => {
          setActiveRental(res.data);
          return api.get(`/rentals/${res.data.id}/services`);
        })
        .then(res => {
          setRentalServices(res.data || []);
        })
        .catch(() => {
          setActiveRental(null);
          setRentalServices([]);
        });

      api.get('/services')
        .then(res => {
          setServiceCatalog(res.data || []);
          if (res.data && res.data.length > 0) {
            setSelectedServiceId(res.data[0].id);
          }
        });
    } else {
      setActiveRental(null);
      setRentalServices([]);
    }
  }, [selectedBooking]);

  const handleAddService = async () => {
    if (!activeRental || !selectedServiceId || serviceQuantity <= 0) return;
    try {
      await api.post(`/rentals/${activeRental.id}/services`, {
        serviceId: selectedServiceId,
        quantity: parseInt(serviceQuantity)
      });
      const res = await api.get(`/rentals/${activeRental.id}/services`);
      setRentalServices(res.data || []);
      setServiceQuantity(1);
      alert('Ghi nhận dịch vụ thành công!');
    } catch (err) {
      alert('Không thể ghi nhận dịch vụ.');
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, null, { params: { status: newStatus } });
      setSelectedBooking(null);
      fetchRoomsAndBookings();
    } catch (err) {
      alert('Không thể cập nhật trạng thái đơn đặt phòng.');
    }
  };

  // Helper to generate days in month
  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const totalDays = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Helper to check if a booking overlaps with a specific date
  const getBookingForRoomAndDate = (roomId, dateNum) => {
    const targetDate = new Date(year, month - 1, dateNum);
    // Standardize time for day overlap checks
    targetDate.setHours(12, 0, 0, 0);

    return bookings.find(b => {
      if (b.roomId !== roomId || b.status === 'CANCELLED') return false;
      const start = new Date(b.checkInDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(b.checkOutDate);
      end.setHours(23, 59, 59, 999);
      return targetDate >= start && targetDate <= end;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      case 'CONFIRMED': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'CHECKED_IN': return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
      default: return 'bg-slate-500/20 border-slate-500/50 text-slate-400';
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📅 Bảng Sơ Đồ Lịch Đặt Phòng
          </h2>
          <p className="text-xs text-slate-400 mt-1">Trực quan lịch thuê phòng của khách sạn theo tháng</p>
        </div>
        
        {/* Month/Year Selectors */}
        <div className="flex gap-3">
          <select 
            value={month} 
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
          >
            {[2025, 2026, 2027].map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>
          <button 
            onClick={fetchRoomsAndBookings}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all text-sm"
          >
            🔄 Tải lại
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-sm">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400 italic">⏳ Đang tải dữ liệu lịch sơ đồ...</div>
      ) : (
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
          {/* Timeline Scrollable Grid Container */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-850 text-slate-400 text-xs font-bold text-left">
                  {/* Sticky room number column */}
                  <th className="sticky left-0 bg-slate-900 px-5 py-4 border-r border-slate-800 w-36 z-20">Phòng</th>
                  <th className="px-3 py-4 border-r border-slate-850 w-24">Loại</th>
                  {daysArray.map(day => (
                    <th key={day} className="px-2 py-3 border-r border-slate-850 text-center w-12 font-mono">
                      {day < 10 ? `0${day}` : day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id} className="border-b border-slate-850 hover:bg-slate-900/20 transition-colors">
                    {/* Sticky room column */}
                    <td className="sticky left-0 bg-slate-950/90 font-black text-white px-5 py-4 border-r border-slate-800 z-10">
                      P.{room.roomNumber}
                    </td>
                    <td className="px-3 py-4 border-r border-slate-850 font-bold text-slate-400 text-sm">
                      Loại {room.roomTypeName}
                    </td>
                    {daysArray.map(day => {
                      const booking = getBookingForRoomAndDate(room.id, day);
                      return (
                        <td 
                          key={day} 
                          className="p-1 border-r border-slate-850 h-16 relative align-middle"
                        >
                          {booking ? (
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className={`w-full h-full min-h-[36px] rounded-lg border text-[10px] p-1 font-bold transition-all hover:scale-105 shadow-md flex items-center justify-center truncate ${getStatusColor(booking.status)}`}
                              title={`Khách: ${booking.guests?.[0]?.customerName || 'N/A'}\nTrạng thái: ${booking.status}`}
                            >
                              {booking.guests?.[0]?.customerName || 'Guest'}
                            </button>
                          ) : (
                            <div className="w-full h-full min-h-[36px] opacity-10 hover:bg-white/10 rounded transition-colors" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal Popup */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedBooking(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">📋 Chi tiết đặt phòng</h3>
              <p className="text-xs text-slate-400 mt-1">Đơn đặt cho phòng {selectedBooking.roomNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Số Phòng:</span>
                <span className="text-white font-bold">P.{selectedBooking.roomNumber} ({selectedBooking.roomTypeName})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Trạng thái:</span>
                <span className={`font-bold inline-block px-2.5 py-0.5 rounded-full text-xs mt-1 border ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Ngày nhận phòng:</span>
                <span className="text-white font-medium">{new Date(selectedBooking.checkInDate).toLocaleDateString('vi-VN')} 14:00</span>
              </div>
              <div>
                <span className="text-slate-500 block">Ngày trả phòng:</span>
                <span className="text-white font-medium">{new Date(selectedBooking.checkOutDate).toLocaleDateString('vi-VN')} 12:00</span>
              </div>
              <div className="col-span-2 border-t border-slate-800 pt-3 mt-1">
                <span className="text-slate-500 block">Giá trị ước tính:</span>
                <span className="text-amber-400 font-extrabold text-lg">
                  {Number(selectedBooking.estimatedPrice).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            {/* Guest list inside popup */}
            {selectedBooking.guests && selectedBooking.guests.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300">👥 Khách đăng ký ({selectedBooking.guests.length})</h4>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedBooking.guests.map((g, idx) => (
                    <div key={idx} className="text-xs bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/60 flex justify-between items-center">
                      <div>
                        <span className="text-white font-semibold">{g.customerName}</span>
                        <span className="text-slate-500 block mt-0.5">CMND/CCCD: {g.idCard}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-850 rounded text-slate-400 font-medium">
                        {g.customerType === 'DOMESTIC' ? 'Khách Việt' : 'Nước ngoài'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Rental Services Management (Checked In only) */}
            {selectedBooking.status === 'CHECKED_IN' && activeRental && (
              <div className="space-y-3 border-t border-slate-800 pt-3">
                <h4 className="text-sm font-bold text-slate-300">🍹 Dịch vụ phòng đã dùng</h4>
                
                {/* Consumed list */}
                <div className="space-y-2 max-h-24 overflow-y-auto pr-1 text-left">
                  {rentalServices.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Chưa sử dụng dịch vụ nào.</p>
                  ) : (
                    rentalServices.map((s, idx) => (
                      <div key={idx} className="text-xs bg-slate-950/20 px-3 py-1.5 rounded-lg border border-slate-800/60 flex justify-between">
                        <span className="text-slate-300">{s.service?.serviceName || 'Dịch vụ'} (x{s.quantity})</span>
                        <span className="text-amber-400 font-mono">
                          {Number(s.priceSnapshot * s.quantity).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Service Catalog Row */}
                {serviceCatalog.length > 0 && (
                  <div className="flex gap-2 items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white p-2 focus:outline-none"
                    >
                      {serviceCatalog.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.serviceName} ({Number(s.price).toLocaleString('vi-VN')} đ)
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={serviceQuantity}
                      onChange={(e) => setServiceQuantity(e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white p-2 text-center focus:outline-none"
                    />
                    <button
                      onClick={handleAddService}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition-all"
                    >
                      Thêm
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions for Receptionist */}
            <div className="flex gap-3 pt-3 border-t border-slate-850">
              {selectedBooking.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'CHECKED_IN')}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all"
                >
                  📝 Check-in (Nhận phòng)
                </button>
              )}
              {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'CHECKED_IN' && (
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'CANCELLED')}
                  className="flex-1 py-3 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-white font-bold rounded-xl text-sm transition-all"
                >
                  ✕ Hủy đặt phòng
                </button>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
