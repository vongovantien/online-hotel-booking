import { useState, useEffect, useRef } from 'react';
import { initChat, getChatMessages, sendChatMessage } from '../services/api';
import { useLanguage } from '../../context/LanguageContext';
import stompClient from '../../lib/stompClient';

export default function CustomerChatBox() {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState(() => localStorage.getItem('hotel_chat_room_id') || '');
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('hotel_chat_customer_name') || '');
  const [customerEmail, setCustomerEmail] = useState(() => localStorage.getItem('hotel_chat_customer_email') || '');
  
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Subscribe to real-time STOMP topic when chat box is open and roomId exists
  useEffect(() => {
    if (!isOpen || !roomId) return;
    
    // 1. Initial load
    getChatMessages(roomId)
      .then(data => setMessages(data))
      .catch(() => {});

    // 2. Real-time STOMP subscribe (< 1ms push from server without polling)
    const subscription = stompClient.subscribe(`/topic/rooms/${roomId}`, (newMsg) => {
      setMessages(prev => {
        // Replace optimistic temp message if content & role matches, or append if new
        const isDuplicate = prev.some(m => m.id === newMsg.id);
        if (isDuplicate) return prev;
        const tempMatch = prev.find(m => m.id?.toString().startsWith('temp-') && m.content === newMsg.content && m.senderRole === newMsg.senderRole);
        if (tempMatch) {
          return prev.map(m => m.id === tempMatch.id ? newMsg : m);
        }
        return [...prev, newMsg];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen, roomId]);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleStartChat = (e) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    setLoading(true);
    setError('');
    initChat(customerName.trim(), customerEmail.trim())
      .then(room => {
        setRoomId(room.id);
        localStorage.setItem('hotel_chat_room_id', room.id);
        localStorage.setItem('hotel_chat_customer_name', customerName.trim());
        localStorage.setItem('hotel_chat_customer_email', customerEmail.trim());
        return getChatMessages(room.id);
      })
      .then(data => setMessages(data))
      .catch(() => {
        setError(lang === 'vi' ? 'Lỗi kết nối máy chủ chat.' : 'Failed to connect to chat server.');
      })
      .finally(() => setLoading(false));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !roomId) return;
    const text = inputMsg.trim();
    setInputMsg('');

    // Optimistic UI
    const tempMsg = {
      id: 'temp-' + Date.now(),
      roomId,
      senderRole: 'CUSTOMER',
      senderName: customerName || 'Khách hàng',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    sendChatMessage(roomId, 'CUSTOMER', customerName || 'Khách hàng', text)
      .then(() => getChatMessages(roomId))
      .then(data => setMessages(data))
      .catch(() => {});
  };

  const handleResetSession = () => {
    localStorage.removeItem('hotel_chat_room_id');
    localStorage.removeItem('hotel_chat_customer_name');
    localStorage.removeItem('hotel_chat_customer_email');
    setRoomId('');
    setMessages([]);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: 360,
          height: 520,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 12px 45px rgba(0,0,0,0.22)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginBottom: 14,
          transition: 'all 0.3s ease',
        }}>
          {/* Header */}
          <div style={{
            background: '#121212',
            color: '#fff',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #ff0909',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: '#ff0909',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: '#fff'
              }}>
                🏨
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>
                  {lang === 'vi' ? 'Hỗ Trợ Lễ Tân 24/7' : 'Hotel Support 24/7'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4ade80', marginTop: 2 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  {lang === 'vi' ? 'Trực tuyến & Sẵn sàng' : 'Online & Ready'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {roomId && (
                <button
                  onClick={handleResetSession}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}
                  title={lang === 'vi' ? 'Bắt đầu cuộc hội thoại mới' : 'Start new conversation'}
                >
                  🔄
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          {!roomId ? (
            /* Welcome / Init Form */
            <div style={{ padding: '30px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
                <h5 style={{ fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                  {lang === 'vi' ? 'Chào mừng bạn!' : 'Welcome!'}
                </h5>
                <p style={{ fontSize: 13, color: '#64748b' }}>
                  {lang === 'vi' ? 'Vui lòng nhập thông tin để bắt đầu trò chuyện trực tiếp với nhân viên Lễ tân.' : 'Please enter your details to chat live with our Receptionist.'}
                </p>
              </div>

              <form onSubmit={handleStartChat} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'vi' ? 'Họ và tên của bạn *' : 'Your full name *'}
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 10,
                      border: '1.5px solid #cbd5e1', fontSize: 14, outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder={lang === 'vi' ? 'Email (tùy chọn)' : 'Email (optional)'}
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 10,
                      border: '1.5px solid #cbd5e1', fontSize: 14, outline: 'none'
                    }}
                  />
                </div>
                {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#ff0909', color: '#fff', border: 'none',
                    padding: '12px 20px', borderRadius: 10, fontWeight: 700,
                    fontSize: 15, cursor: 'pointer', transition: 'all 0.2s',
                    marginTop: 6
                  }}
                >
                  {loading ? (lang === 'vi' ? 'Đang kết nối...' : 'Connecting...') : (lang === 'vi' ? 'Bắt Đầu Trò Chuyện ➔' : 'Start Chatting ➔')}
                </button>
              </form>
            </div>
          ) : (
            /* Messages List */
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg) => {
                const isCustomer = msg.senderRole === 'CUSTOMER';
                const isSystem = msg.senderName === 'Hệ thống' || msg.content?.includes('tự động đóng') || msg.content?.includes('kết thúc');
                if (isSystem) {
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
                      <div style={{
                        background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b',
                        fontSize: 12, padding: '6px 14px', borderRadius: 20, fontWeight: 600,
                        textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                      }}>
                        🔒 {msg.content}
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isCustomer ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {!isCustomer && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 3, marginLeft: 4 }}>
                        {msg.senderName} ({msg.senderRole === 'ADMIN' ? 'Admin' : 'Lễ tân'})
                      </span>
                    )}
                    <div style={{
                      maxWidth: '82%',
                      padding: '10px 14px',
                      borderRadius: isCustomer ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: isCustomer ? '#ff0909' : '#fff',
                      color: isCustomer ? '#fff' : '#1e293b',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      fontSize: 14,
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                      border: isCustomer ? 'none' : '1px solid #e2e8f0'
                    }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, padding: '0 4px' }}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Footer or Closed Banner */}
          {roomId && (
            (() => {
              const isClosedRoom = messages.some(m => m.senderName === 'Hệ thống' || m.content?.includes('đã được kết thúc') || m.content?.includes('tự động đóng'));
              if (isClosedRoom) {
                return (
                  <div style={{ padding: '14px', background: '#fee2e2', borderTop: '1px solid #f87171', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>
                      🔒 {lang === 'vi' ? 'Phiên trò chuyện này đã kết thúc.' : 'This chat session has ended.'}
                    </span>
                    <button
                      onClick={handleResetSession}
                      style={{
                        padding: '8px 16px', borderRadius: 8, background: '#dc2626', color: '#fff',
                        border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      🔄 {lang === 'vi' ? 'Bắt Đầu Phiên Tư Vấn Mới' : 'Start New Chat Session'}
                    </button>
                  </div>
                );
              }
              return (
                <form onSubmit={handleSend} style={{
                  padding: '12px', background: '#fff', borderTop: '1px solid #e2e8f0',
                  display: 'flex', gap: 8, alignItems: 'center'
                }}>
                  <input
                    type="text"
                    placeholder={lang === 'vi' ? 'Nhập tin nhắn...' : 'Type a message...'}
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 20,
                      border: '1.5px solid #cbd5e1', fontSize: 14, outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      width: 40, height: 40, borderRadius: '50%', background: '#ff0909',
                      color: '#fff', border: 'none', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', fontSize: 16, flexShrink: 0
                    }}
                  >
                    ➤
                  </button>
                </form>
              );
            })()
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#ff0909',
          color: '#fff',
          border: 'none',
          borderRadius: 50,
          padding: '14px 24px',
          boxShadow: '0 8px 30px rgba(255, 9, 9, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 15,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span style={{ fontSize: 22 }}>💬</span>
        <span>{lang === 'vi' ? 'Hỗ Trợ CSKH' : 'Live Chat'}</span>
      </button>
    </div>
  );
}
