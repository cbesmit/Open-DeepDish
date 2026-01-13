import { create } from 'zustand';

// Inicializar estado leyendo síncronamente del storage para evitar parpadeos/redirects
const storedToken = localStorage.getItem('token');

const useAuthStore = create((set) => ({
  user: null,
  token: storedToken,
  isAuthenticated: !!storedToken,

  login: (token, expiresIn) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: () => {
    // Método para re-validar manualmente si es necesario, 
    // aunque el estado inicial ya cubre el caso de carga.
    const token = localStorage.getItem('token');
    if (token) {
      set({ token, isAuthenticated: true });
    } else {
      set({ token: null, isAuthenticated: false });
    }
  }
}));

export default useAuthStore;
