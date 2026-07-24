import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getRooms, getAvailableRooms } from '../services/api';
import BookingModal from '../components/BookingModal';
import PageBanner from '../components/PageBanner';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const ROOM_IMGS = [
  '/images/room1.jpg', '/images/room2.jpg', '/images/room3.jpg',
  '/images/room4.jpg', '/images/room5.jpg', '/images/room6.jpg',
];

export default function RoomsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  
  // Date filters
  const [checkIn, setCheckIn]             = useState('');
  const [checkOut, setCheckOut]           = useState('');
  
  // Filters & Search & Sort states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [typeFilter, setTypeFilter]       = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [sortBy, setSortBy]               = useState('default');
  
  // Pagination state
  const [currentPage, setCurrentPage]     = useState(1);
  const itemsPerPage = 6;

  const [selectedRoom, setSelectedRoom] = useState(null);

  // Reviews states (Phase 3)
  const [reviewsMap, setReviewsMap] = useState({});
  const [viewingReviewsType, setViewingReviewsType] = useState(null);

  const fetchRooms = () => {
    setLoading(true);
    const apiCall = (checkIn && checkOut)
      ? getAvailableRooms(checkIn, checkOut)
      : getRooms();
    apiCall
      .then(async data => {
        setRooms(data);
        setError('');
        
        const reviewsData = {};
        for (const room of data) {
          if (room.roomTypeId && !reviewsData[room.roomTypeId]) {
            try {
              const revRes = await api.get(`/reviews/room-type/${room.roomTypeId}`);
              reviewsData[room.roomTypeId] = revRes.data || [];
            } catch {
              reviewsData[room.roomTypeId] = [];
            }
          }
        }
        setReviewsMap(reviewsData);
      })
      .catch(() => setError(t('rooms.notFound')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRooms(); }, [checkIn, checkOut]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset to page 1 whenever any filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, typeFilter, statusFilter, sortBy]);

  // Apply filters, search, and sorting
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // 1. Search filter (roomNumber, roomTypeName, note)
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim();
        const matchNum  = room.roomNumber?.toLowerCase().includes(kw);
        const matchType = room.roomTypeName?.toLowerCase().includes(kw);
        const matchNote = room.note?.toLowerCase().includes(kw);
        if (!matchNum && !matchType && !matchNote) return false;
      }
      // 2. Type filter
      if (typeFilter && room.roomTypeName !== typeFilter) {
        return false;
      }
      // 3. Status filter
      if (statusFilter && room.status !== statusFilter) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'az') {
        return a.roomNumber.localeCompare(b.roomNumber, 'vi', { numeric: true });
      }
      if (sortBy === 'za') {
        return b.roomNumber.localeCompare(a.roomNumber, 'vi', { numeric: true });
      }
      if (sortBy === 'price-high') {
        return Number(b.price || b.basePrice || 0) - Number(a.price || a.basePrice || 0);
      }
      if (sortBy === 'price-low') {
        return Number(a.price || a.basePrice || 0) - Number(b.price || b.basePrice || 0);
      }
      return 0; // default order
    });
  }, [rooms, searchKeyword, typeFilter, statusFilter, sortBy]);

  // Pagination calculation
  const totalItems = filteredRooms.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = () => {
    setSearchKeyword('');
    setTypeFilter('');
    setStatusFilter('');
    setSortBy('default');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchKeyword || typeFilter || statusFilter || sortBy !== 'default';

  return (
    <>
      <PageBanner title={t('rooms.pageTitle')} />

      <div className="our_room" style={{ paddingTop: 50, paddingBottom: 70 }}>
        <div className="container">

          {/* ── Control Bar: Search & Sort ── */}
          <div style={{
            background: '#fff', padding: '24px', borderRadius: 16,
            boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid #eee',
            marginBottom: 24,
          }}>
            <div className="row" style={{ alignItems: 'center', rowGap: 16 }}>
              {/* Date Filters Row */}
              <div className="col-12" style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#444' }}>{t('rooms.checkinLabel')}</span>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={e => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 20,
                        border: '1.5px solid #e0e0e0',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#444' }}>{t('rooms.checkoutLabel')}</span>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={e => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 20,
                        border: '1.5px solid #e0e0e0',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                  {(checkIn || checkOut) && (
                    <button
                      onClick={() => { setCheckIn(''); setCheckOut(''); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ff0909',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {t('rooms.clearDateFilters')}
                    </button>
                  )}
                </div>
              </div>

              {/* Search Box */}
              <div className="col-lg-6 col-md-12">
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    placeholder={t('rooms.searchPlaceholder')}
                    style={{
                      width: '100%', padding: '12px 40px 12px 18px',
                      borderRadius: 30, border: '1.5px solid #e0e0e0',
                      fontSize: 15, outline: 'none', transition: 'border-color 0.2s',
                    }}
                  />
                  {searchKeyword && (
                    <button
                      onClick={() => setSearchKeyword('')}
                      style={{
                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        background: 'transparent', border: 'none', color: '#999',
                        fontSize: 18, cursor: 'pointer', padding: 4,
                      }}
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Sort Dropdown & Clear button */}
              <div className="col-lg-6 col-md-12">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#444' }}>{t('rooms.sortLabel')}</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{
                      padding: '10px 18px', borderRadius: 30, border: '1.5px solid #e0e0e0',
                      background: '#fff', fontSize: 14, fontWeight: 600, color: '#222',
                      outline: 'none', cursor: 'pointer',
                    }}
                  >
                    <option value="default">{t('rooms.sortDefault')}</option>
                    <option value="price-high">{t('rooms.sortPriceHigh')}</option>
                    <option value="price-low">{t('rooms.sortPriceLow')}</option>
                    <option value="az">{t('rooms.sortAZ')}</option>
                    <option value="za">{t('rooms.sortZA')}</option>
                  </select>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      style={{
                        padding: '10px 18px', borderRadius: 30, border: '1px solid #ff0909',
                        background: '#fff3f3', color: '#ff0909', fontWeight: 600,
                        fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      ✕ {t('rooms.clearFilters')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Filters: Type & Status ── */}
            <div style={{
              display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center',
              marginTop: 20, paddingTop: 18, borderTop: '1px solid #f0f0f0',
            }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#444' }}>{t('rooms.filterLabel')}</span>

              {/* Type pills */}
              {['', 'A', 'B', 'C'].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  style={{
                    padding: '6px 18px', borderRadius: 20, border: 'none',
                    background: typeFilter === type ? '#ff0909' : '#f0f0f0',
                    color: typeFilter === type ? '#fff' : '#333',
                    fontWeight: 600, cursor: 'pointer', fontSize: 13,
                    transition: 'all 0.2s',
                  }}
                >
                  {type === '' ? t('rooms.allTypes') : `${t('rooms.typePrefix')} ${type}`}
                </button>
              ))}

              <div style={{ width: 1, height: 22, background: '#ddd', margin: '0 4px' }} />

              {/* Status pills */}
              {[
                { val: '', label: t('rooms.allStatus') },
                { val: 'AVAILABLE', label: t('home.available') },
                { val: 'RENTED', label: t('home.rented') },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setStatusFilter(val)}
                  style={{
                    padding: '6px 18px', borderRadius: 20, border: 'none',
                    background: statusFilter === val ? '#121212' : '#f0f0f0',
                    color: statusFilter === val ? '#fff' : '#333',
                    fontWeight: 600, cursor: 'pointer', fontSize: 13,
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Results summary bar */}
          {!loading && !error && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 24, padding: '0 6px', fontSize: 14, color: '#666',
            }}>
              <div>
                {totalItems > 0 ? (
                  <>
                    {t('rooms.showing')} <strong>{startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)}</strong> {t('rooms.of')} <strong>{totalItems}</strong> phòng
                  </>
                ) : (
                  t('rooms.notFound')
                )}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <img src="/images/loading.gif" alt="Loading" style={{ width: 80 }} />
              <p style={{ marginTop: 10, color: '#888' }}>{t('rooms.loading')}</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: '#c00', fontSize: 16 }}>{error}</p>
              <button className="read_more" style={{ marginTop: 12 }} onClick={fetchRooms}>
                {t('rooms.retry')}
              </button>
            </div>
          )}

          {/* Room grid */}
          {!loading && !error && (
            <>
              {paginatedRooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f9f9f9', borderRadius: 16 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <h4 style={{ color: '#333', marginBottom: 8 }}>{t('rooms.notFound')}</h4>
                  <p style={{ color: '#777', marginBottom: 18 }}>Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc của bạn.</p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="read_more" style={{ display: 'inline-block', border: 'none', cursor: 'pointer' }}>
                      {t('rooms.clearFilters')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="row">
                  {paginatedRooms.map((room, i) => (
                    <div key={room.id} className="col-md-4 col-sm-6">
                      <div id="serv_hover" className="room" style={{ marginBottom: 30 }}>
                        <div className="room_img">
                          <figure>
                            <img src={ROOM_IMGS[(startIndex + i) % ROOM_IMGS.length]} alt={`Room ${room.roomNumber}`} />
                          </figure>
                        </div>
                        <div className="bed_room">
                          {/* Status badge */}
                          <span style={{
                            display: 'inline-block', padding: '3px 12px', borderRadius: 20,
                            fontSize: 12, fontWeight: 600, marginBottom: 10,
                            background: room.status === 'AVAILABLE' ? '#e6f9ee' : '#ffe0e0',
                            color: room.status === 'AVAILABLE' ? '#0a7c3e' : '#c00',
                          }}>
                            {room.status === 'AVAILABLE' ? t('home.available') : t('home.rented')}
                          </span>

                          <h3>Phòng {room.roomNumber}</h3>

                          <div style={{ marginBottom: 6 }}>
                            <span style={{ background: '#f0f0f0', padding: '2px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                              {t('rooms.typePrefix')} {room.roomTypeName}
                            </span>
                          </div>

                          <p style={{ color: '#ff0909', fontWeight: 700, fontSize: 18, marginBottom: 14 }}>
                            {Number(room.price || room.basePrice || 0).toLocaleString('vi-VN')} {t('home.pricePerDay')}
                          </p>

                          <p style={{ fontSize: 13, color: '#666', marginBottom: 16, minHeight: 38 }}>
                            {room.note || `Phòng ${room.roomTypeName === 'C' ? 'VIP' : room.roomTypeName === 'B' ? 'cao cấp' : 'tiêu chuẩn'} với đầy đủ tiện nghi hiện đại.`}
                          </p>

                          {/* Rating & Review Summary (Phase 3) */}
                          {(() => {
                            const revs = reviewsMap[room.roomTypeId] || [];
                            const avgRating = revs.length > 0
                              ? (revs.reduce((acc, r) => acc + r.rating, 0) / revs.length).toFixed(1)
                              : null;
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 13 }}>
                                <span style={{ color: '#fbbf24', fontSize: 16 }}>★</span>
                                <span style={{ fontWeight: 700, color: '#111' }}>
                                  {avgRating ? `${avgRating}/5.0` : 'Chưa có đánh giá'}
                                </span>
                                <span style={{ color: '#888' }}>({revs.length})</span>
                                {revs.length > 0 && (
                                  <button
                                    onClick={() => setViewingReviewsType({ id: room.roomTypeId, name: room.roomTypeName, reviews: revs })}
                                    style={{
                                      background: 'none', border: 'none', color: '#ff0909', fontWeight: 600,
                                      padding: 0, textDecoration: 'underline', cursor: 'pointer', marginLeft: 'auto',
                                      fontSize: 12
                                    }}
                                  >
                                    Xem đánh giá
                                  </button>
                                )}
                              </div>
                            );
                          })()}

                          {room.status === 'AVAILABLE' ? (
                            <button
                              className="book_btn"
                              style={{ maxWidth: '100%', border: 'none', cursor: 'pointer' }}
                              onClick={() => {
                              if (!user) {
                                navigate('/login', { state: { from: '/rooms' } });
                                return;
                              }
                              setSelectedRoom(room);
                            }}
                            >
                              {t('rooms.bookRoom')}
                            </button>
                          ) : (
                            <button
                              disabled
                              style={{
                                background: '#ccc', color: '#888', border: 'none',
                                padding: '10px 0', borderRadius: 50, width: '100%',
                                fontSize: 16, cursor: 'not-allowed',
                              }}
                            >
                              {t('rooms.rentedBtn')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Pagination Controls ── */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  gap: 8, marginTop: 30, flexWrap: 'wrap',
                }}>
                  {/* Previous button */}
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    style={{
                      padding: '8px 18px', borderRadius: 30, border: '1px solid #ddd',
                      background: currentPage === 1 ? '#f5f5f5' : '#fff',
                      color: currentPage === 1 ? '#aaa' : '#121212',
                      fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {t('rooms.prev')}
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        width: 40, height: 40, borderRadius: '50%', border: 'none',
                        background: currentPage === page ? '#ff0909' : '#f0f0f0',
                        color: currentPage === page ? '#fff' : '#333',
                        fontWeight: 700, fontSize: 15, cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next button */}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    style={{
                      padding: '8px 18px', borderRadius: 30, border: '1px solid #ddd',
                      background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                      color: currentPage === totalPages ? '#aaa' : '#121212',
                      fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {t('rooms.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => { setSelectedRoom(null); fetchRooms(); }}
        />
      )}

      {viewingReviewsType && (
        <div className="booking-overlay" onClick={() => setViewingReviewsType(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 16
        }}>
          <div className="booking-modal" onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500,
            overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          }}>
            <div className="booking-modal-header" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid #eee'
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 750 }}>Đánh giá Loại phòng {viewingReviewsType.name}</h3>
              <button className="booking-close" onClick={() => setViewingReviewsType(null)} style={{
                background: 'none', border: 'none', fontSize: 20, cursor: 'pointer'
              }}>✕</button>
            </div>
            <div className="booking-modal-body" style={{ maxHeight: 350, overflowY: 'auto', padding: 20 }}>
              {viewingReviewsType.reviews.map((r, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 12, textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#111' }}>@{r.username}</span>
                    <span style={{ color: '#fbbf24', fontSize: 12 }}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: 13, color: '#555' }}>{r.comment}</p>
                  <small style={{ color: '#aaa', fontSize: 11 }}>
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
