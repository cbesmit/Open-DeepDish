import api from './api';

const recetasService = {
  guardarReceta: async (recetaData) => {
    // recetaData debe incluir: { nombre, descripcion, contenido_full, config_snapshot, ... }
    const response = await api.post('/recetas', recetaData);
    return response.data;
  },

  getRecetas: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    // Filtros de texto y paginación
    if (filtros.q) params.append('q', filtros.q);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    // Filtros de selección directa
    if (filtros.tipo_comida) params.append('tipo_comida', filtros.tipo_comida);
    if (filtros.dificultad) params.append('dificultad', filtros.dificultad);
    if (filtros.objetivo_agrado) params.append('objetivo_agrado', filtros.objetivo_agrado);
    if (filtros.tipo_cocina) params.append('tipo_cocina', filtros.tipo_cocina);
    
    // Filtros especiales
    if (filtros.tiempo) params.append('tiempo', filtros.tiempo); // Legacy support if needed
    if (filtros.persona_id) params.append('persona_id', filtros.persona_id);
    
    // Rango de salud
    if (filtros.min_salud !== undefined) params.append('min_salud', filtros.min_salud);
    if (filtros.max_salud !== undefined) params.append('max_salud', filtros.max_salud);
    // Fallback legacy
    if (filtros.nivel_saludable && filtros.min_salud === undefined) {
        params.append('nivel_saludable', filtros.nivel_saludable);
    }

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
  },

  deleteReceta: async (id) => {
    const response = await api.delete(`/recetas/${id}`);
    return response.data;
  }
};

export default recetasService;