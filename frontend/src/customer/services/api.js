import axios from 'axios';
import { getCookie } from '../../lib/cookie';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Inject Bearer token on every request
api.interceptors.request.use((config) => {
  const token = getCookie('auth_token') || getCookie('customer_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────

// Backend LoginRequest: { usernameOrEmail, password }
export const login = (username, password) =>
  api.post('/auth/login', { usernameOrEmail: username, password }).then(r => r.data);

// Backend RegisterRequest: { username, email, password, role }
export const register = (username, password, fullName, email) =>
  api.post('/auth/register', {
    username,
    email: email || `${username}@hotelify.vn`,
    password,
    role: 'CUSTOMER',
  }).then(r => r.data);

export const logout = () =>
  api.post('/auth/logout').catch(() => {});

// ─── Rooms ───────────────────────────────────────────────────────────────────

// GET /api/v1/rooms  — public endpoint, no auth required
export const getRooms = (params = {}) =>
  api.get('/rooms', { params }).then(r => r.data);

export const createRoom = (data) =>
  api.post('/rooms', data).then(r => r.data);

export const updateRoom = (id, data) =>
  api.put(`/rooms/${id}`, data).then(r => r.data);

export const deleteRoom = (id) =>
  api.delete(`/rooms/${id}`).then(r => r.data);

// ─── Booking (rental) ────────────────────────────────────────────────────────

/**
 * POST /api/v1/rentals
 * Backend RentalRequest: { roomId, startDate (ISO LocalDateTime), customers }
 * customers: [{ customerName, customerType, idCard, address }]
 */
export const createRental = (roomId, startDate, customers) =>
  api.post('/rentals', { roomId, startDate, customers }).then(r => r.data);

// ─── Rentals ─────────────────────────────────────────────────────────────────
export const getMyRentals = () =>
  api.get('/rentals').then(r => r.data);

// ─── Online Bookings (Phase 1) ───────────────────────────────────────────────
export const getAvailableRooms = (checkIn, checkOut) =>
  api.get('/rooms/available', { params: { checkIn, checkOut } }).then(r => r.data);

export const createBooking = (roomId, checkInDate, checkOutDate, guests) =>
  api.post('/bookings', { roomId, checkInDate, checkOutDate, guests }).then(r => r.data);

export const getMyBookings = () =>
  api.get('/bookings/my').then(r => r.data);

export const getAllBookings = () =>
  api.get('/bookings').then(r => r.data);

export const updateBookingStatus = (id, status) =>
  api.put(`/bookings/${id}/status`, null, { params: { status } }).then(r => r.data);

export const cancelBooking = (id) =>
  api.put(`/bookings/${id}/cancel`).then(r => r.data);

// ─── Chat (stub — returns empty if backend chat not yet implemented) ─────────

/**
 * These stubs gracefully handle missing backend chat endpoints.
 * Replace with real API calls when backend chat is implemented.
 */
export const initChat = async (customerName, customerEmail) => {
  try {
    const res = await api.post('/chat/init', { customerName, customerEmail });
    return res.data;
  } catch {
    // Fallback: create a local session ID so UI still works
    const id = `local-${Date.now()}`;
    return { id, customerName };
  }
};

export const getChatMessages = async (roomId) => {
  if (roomId.startsWith('local-')) return [];
  try {
    const res = await api.get(`/chat/rooms/${roomId}/messages`);
    return res.data;
  } catch {
    return [];
  }
};

export const sendChatMessage = async (roomId, senderRole, senderName, content) => {
  if (roomId && roomId.startsWith('local-')) return null;
  try {
    const res = await api.post(`/chat/rooms/${roomId}/messages`, {
      senderRole, senderName, content,
    });
    return res.data;
  } catch {
    return null;
  }
};

export const getChatRooms = async () => {
  try {
    const res = await api.get('/chat/rooms');
    return res.data;
  } catch {
    return [];
  }
};

export const markChatRead = async (roomId) => {
  try {
    const res = await api.post(`/chat/rooms/${roomId}/read`);
    return res.data;
  } catch {
    return null;
  }
};

export const closeChatRoom = async (roomId) => {
  try {
    const res = await api.post(`/chat/rooms/${roomId}/close`);
    return res.data;
  } catch {
    return null;
  }
};

export default api;
