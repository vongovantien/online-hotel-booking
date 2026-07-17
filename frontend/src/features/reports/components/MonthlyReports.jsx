import { useState, useEffect } from 'react';
import api from '../../../lib/axios';

export default function MonthlyReports() {
  const [reportTab, setReportTab] = useState('revenue');
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [revenueData, setRevenueData] = useState([]);
  const [utilizationData, setUtilizationData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (reportTab === 'revenue') {
        const res = await api.get('/reports/revenue', {
          params: { year, month },
        });
        setRevenueData(res.data);
      } else {
        const res = await api.get('/reports/utilization', {
          params: { year, month },
        });
        setUtilizationData(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải báo cáo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportTab, year, month]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">
            Kết xuất báo cáo kinh doanh
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Báo cáo doanh thu & tần suất sử dụng phòng tháng
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-amber-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-amber-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800/80 w-fit">
        <button
          onClick={() => setReportTab('revenue')}
          className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all ${
            reportTab === 'revenue'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📈 5.1: Doanh thu theo loại phòng
        </button>
        <button
          onClick={() => setReportTab('utilization')}
          className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all ${
            reportTab === 'utilization'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📊 5.2: Mật độ sử dụng phòng
        </button>
      </div>

      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
        {reportTab === 'revenue' ? (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider text-left border-b border-slate-800">
                <th className="px-6 py-4">STT</th>
                <th className="px-6 py-4">Loại Phòng</th>
                <th className="px-6 py-4 text-right">Doanh Thu</th>
                <th className="px-6 py-4 text-right">Tỷ Lệ (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-12 text-slate-500 animate-pulse font-medium"
                  >
                    Đang kết xuất...
                  </td>
                </tr>
              ) : revenueData.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-12 text-slate-500"
                  >
                    Không có dữ liệu hóa đơn nào trong tháng {month}/{year}
                  </td>
                </tr>
              ) : (
                revenueData.map((item, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 text-white font-bold">
                      Loại {item.roomTypeName}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-bold text-lg">
                      {Number(item.revenue).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-32 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                            style={{ width: `${item.ratio}%` }}
                          />
                        </div>
                        <span className="text-amber-400 font-bold text-sm w-12 text-right">
                          {Number(item.ratio).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider text-left border-b border-slate-800">
                <th className="px-6 py-4">STT</th>
                <th className="px-6 py-4">Số Phòng</th>
                <th className="px-6 py-4 text-right">Số Ngày Thuê</th>
                <th className="px-6 py-4 text-right">Tỷ Lệ Mật Độ (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-12 text-slate-500 animate-pulse font-medium"
                  >
                    Đang kết xuất...
                  </td>
                </tr>
              ) : utilizationData.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-12 text-slate-500"
                  >
                    Không có dữ liệu thuê phòng nào trong tháng {month}/{year}
                  </td>
                </tr>
              ) : (
                utilizationData.map((item, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 text-white font-bold">
                      Phòng {item.roomNumber}
                    </td>
                    <td className="px-6 py-4 text-right text-indigo-400 font-bold">
                      {item.rentedDays} ngày
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-32 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{ width: `${item.densityRatio}%` }}
                          />
                        </div>
                        <span className="text-indigo-400 font-bold text-sm w-12 text-right">
                          {Number(item.densityRatio).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
