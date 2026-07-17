import { createContext, useContext, useState } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/api';

const AuthContext = createContext({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

/**
 * Normalises the backend AuthResponse into a consistent user shape:
 * { token, username, role, userId, fullName }
 *
 * Backend returns: { token, tokenType, username, role, userId }
 * fullName is not in the response — we fall back to username.
 */
const normaliseUser = (data) => ({
  token:    data.token,
  username: data.username,
  role:     data.role,
  userId:   data.userId,
  fullName: data.fullName || data.username,  // backend may add fullName later
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginFn = async (username, password) => {
    const raw  = await apiLogin(username, password);
    const data = normaliseUser(raw);
    localStorage.setItem('customer_token', data.token);
    localStorage.setItem('customer_user',  JSON.stringify(data));
    setUser(data);
    return data;
  };

  const registerFn = async (username, password, fullName, email) => {
    const raw  = await apiRegister(username, password, fullName, email);
    const data = normaliseUser({ ...raw, fullName });  // inject fullName since backend doesn't echo it
    localStorage.setItem('customer_token', data.token);
    localStorage.setItem('customer_user',  JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logoutFn = async () => {
    await apiLogout();
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login: loginFn, register: registerFn, logout: logoutFn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext) || {
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
};
