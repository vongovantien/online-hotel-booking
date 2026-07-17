import { useState, useEffect, useRef } from 'react';
import { getChatRooms, getChatMessages, sendChatMessage, markChatRead, closeChatRoom } from '../../customer/services/api';
import stompClient from '../../lib/stompClient';

export default function AdminChatView({ user }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);

  const messagesEndRef = useRef(null);

  const fetchRooms = () => {
    getChatRooms()
      .then(data => {
        setRooms(data);
        setLoadingRooms(false);
      })
      .catch(() => setLoadingRooms(false));
  };

  const fetchMessages = (roomId) => {
    if (!roomId) return;
    getChatMessages(roomId)
      .then(data => setMessages(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchRooms();
    const sub = stompClient.subscribe('/topic/admin/chat-alerts', () => {
      fetchRooms();
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedRoomId) return;
    fetchMessages(selectedRoomId);
    const sub = stompClient.subscribe(`/topic/rooms/${selectedRoomId}`, (newMsg) => {
      setMessages(prev => {
        const isDuplicate = prev.some(m => m.id === newMsg.id);
        if (isDuplicate) return prev;
        const tempMatch = prev.find(m => m.id?.toString().startsWith('temp-') && m.content === newMsg.content && m.senderRole === newMsg.senderRole);
        if (tempMatch) {
          return prev.map(m => m.id === tempMatch.id ? newMsg : m);
        }
        return [...prev, newMsg];
      });
      fetchRooms();
    });
    return () => sub.unsubscribe();
  }, [selectedRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    fetchMessages(roomId);
    markChatRead(roomId).then(() => fetchRooms());
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedRoomId) return;
    const content = replyText.trim();
    setReplyText('');

    const tempMsg = {
      id: 'temp-' + Date.now(),
      roomId: selectedRoomId,
      senderRole: user?.role || 'RECEPTIONIST',
      senderName: user?.username || 'Lễ tân Khách sạn',
      content,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    sendChatMessage(selectedRoomId, user?.role || 'RECEPTIONIST', user?.username || 'Lễ tân Khách sạn', content)
      .then(() => {
        fetchMessages(selectedRoomId);
        fetchRooms();
      })
      .catch(() => {});
  };

  const handleCloseRoom = () => {
    if (!selectedRoomId) return;
    if (!window.confirm('Bạn có chắc chắn muốn kết thúc và đóng cuộc trò chuyện này không?')) return;
    closeChatRoom(selectedRoomId).then(() => {
      fetchMessages(selectedRoomId);
      fetchRooms();
    });
  };

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const totalUnread = rooms.reduce((acc, r) => acc + (r.unreadAdminCount || 0), 0);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl h-[calc(100vh-180px)] flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>💬</span> Quản lý Tư vấn & Chăm sóc Khách hàng (Live Chat)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Kết nối thời gian thực với khách hàng trên website đặt phòng
          </p>
        </div>
        {totalUnread > 0 ? (
          <div className="bg-rose-500/20 border border-rose-500 text-rose-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse">
            <span className="text-base">🔔</span>
            <span>Có {totalUnread} tin nhắn mới chưa phản hồi!</span>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <span>✓</span> Tất cả tin nhắn đã được xử lý
          </div>
        )}
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="w-80 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-900 border-b border-slate-800 font-bold text-xs text-slate-300 flex items-center justify-between">
            <span>Khách hàng yêu cầu hỗ trợ ({rooms.length})</span>
            <button onClick={fetchRooms} className="text-slate-400 hover:text-white" title="Làm mới">🔄</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loadingRooms && rooms.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">Đang tải danh sách chat...</p>
            ) : rooms.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">Chưa có cuộc trò chuyện nào.</p>
            ) : (
              rooms.map(room => {
                const isSelected = room.id === selectedRoomId;
                const hasUnread = (room.unreadAdminCount || 0) > 0;
                const isClosed = room.status === 'CLOSED';
                return (
                  <div
                    key={room.id}
                    onClick={() => handleSelectRoom(room.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600/20 border-amber-500 text-white'
                        : hasUnread
                        ? 'bg-rose-950/30 border-rose-500/80 text-slate-200'
                        : isClosed
                        ? 'bg-slate-950/40 border-slate-800/40 opacity-70 text-slate-400'
                        : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm truncate">
                        {room.customerName} {isClosed && '🔒'}
                      </span>
                      {hasUnread && (
                        <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          +{room.unreadAdminCount} Mới
                        </span>
                      )}
                    </div>
                    {room.customerEmail && (
                      <div className="text-[11px] text-slate-500 truncate mb-1">{room.customerEmail}</div>
                    )}
                    <p className="text-xs text-slate-400 truncate font-normal">
                      {room.lastMessage || 'Cuộc trò chuyện mới'}
                    </p>
                    <div className="text-[10px] text-slate-500 text-right mt-1">
                      {room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          {selectedRoom ? (
            <>
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Đang tư vấn cho: <span className="text-amber-400">{selectedRoom.customerName}</span>
                  </h4>
                  {selectedRoom.customerEmail && (
                    <p className="text-xs text-slate-400">Email: {selectedRoom.customerEmail}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 ${
                    selectedRoom.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    <span>{selectedRoom.status === 'OPEN' ? '🟢 Đang hoạt động' : '🔒 Đã kết thúc'}</span>
                  </div>
                  {selectedRoom.status === 'OPEN' && (
                    <button
                      onClick={handleCloseRoom}
                      className="bg-rose-600/20 hover:bg-rose-600 border border-rose-500 text-rose-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow"
                      title="Kết thúc và đóng phòng chat này"
                    >
                      🔒 Kết thúc Chat
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => {
                  const isCustomer = msg.senderRole === 'CUSTOMER';
                  const isSystem = msg.senderName === 'Hệ thống' || msg.content?.includes('tự động đóng') || msg.content?.includes('kết thúc');
                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="bg-slate-900/90 border border-slate-800 text-slate-400 text-xs px-4 py-2 rounded-full font-medium shadow-inner flex items-center gap-2">
                          <span>🔒</span>
                          <span>{msg.content}</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                    >
                      <span className="text-[11px] text-slate-500 font-bold mb-1 px-1">
                        {msg.senderName} ({isCustomer ? 'Khách hàng' : msg.senderRole === 'ADMIN' ? 'Admin' : 'Lễ tân'})
                      </span>
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                          isCustomer
                            ? 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700/80'
                            : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-tr-sm shadow-md'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-600 mt-1 px-1">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {selectedRoom.status === 'CLOSED' ? (
                <div className="p-4 bg-slate-900/90 border-t border-slate-800 text-center">
                  <p className="text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
                    <span>🔒 Phiên tư vấn này đã kết thúc. Khách hàng sẽ cần bắt đầu hội thoại mới để tiếp tục.</span>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
                  <input
                    type="text"
                    placeholder="Nhập nội dung tư vấn / phản hồi khách hàng..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                  >
                    Gửi ➔
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="text-5xl mb-3">💬</div>
                <h4 className="text-base font-bold text-slate-400">Chọn cuộc trò chuyện</h4>
                <p className="text-xs text-slate-500 mt-1">Chọn một khách hàng ở cột bên trái để bắt đầu tư vấn và hỗ trợ.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
