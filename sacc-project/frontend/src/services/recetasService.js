import api from './api';

const recetasService = {
  guardarReceta: async (recetaData) => {
    // recetaData debe incluir: { nombre, descripcion, contenido_full, config_snapshot, ... }
    const response = await api.post('/recetas', recetaData);
    return response.data;
  },

  getRecetas: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.q) params.append('q', filtros.q);
    if (filtros.nivel_saludable) params.append('nivel_saludable', filtros.nivel_saludable);
    if (filtros.tiempo) params.append('tiempo', filtros.tiempo);
    if (filtros.persona_id) params.append('persona_id', filtros.persona_id);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);

    const response = await api.get(`/recetas?${params.toString()}`);
    return response.data;
  },

  getRecetaById: async (id) => {
    const response = await api.get(`/recetas/${id}`);
    return response.data;
  },

  calificarReceta: async (id, calificaciones) => {
    // calificaciones: [{ persona_id, valoracion }]
    const response = await api.post(`/recetas/${id}/calificar`, { calificaciones });
    return response.data;
  }
};

export default recetasService;
