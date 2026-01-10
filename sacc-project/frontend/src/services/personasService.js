import api from './api';

const personasService = {
  getAll: async () => {
    const response = await api.get('/personas');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/personas', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/personas/${id}`, data);
    return response.data;
  },

  toggleEstado: async (id, activo) => {
    const response = await api.patch(`/personas/${id}/estado`, { activo });
    return response.data;
  }
};

export default personasService;
