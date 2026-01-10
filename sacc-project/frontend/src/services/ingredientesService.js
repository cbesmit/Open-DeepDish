import api from './api';

const ingredientesService = {
  getAll: async () => {
    const response = await api.get('/ingredientes');
    return response.data;
  },

  create: async (nombre) => {
    const response = await api.post('/ingredientes', { nombre });
    return response.data;
  },

  toggle: async (id) => {
    const response = await api.patch(`/ingredientes/${id}/toggle`);
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/ingredientes/${id}`);
    return response.data;
  }
};

export default ingredientesService;
