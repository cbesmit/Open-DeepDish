import { create } from 'zustand';
import recetasService from '../services/recetasService';

const useRecetasStore = create((set, get) => ({
  recetas: [],
  recetaActiva: null,
  filtros: {
    q: '',
    nivel_saludable: 0,
    tiempo: '',
    persona_id: ''
  },
  pagination: {
    page: 1,
    total: 0,
    limit: 10,
    totalPages: 1
  },
  isLoading: false,
  error: null,

  fetchRecetas: async () => {
    set({ isLoading: true, error: null });
    const { filtros, pagination } = get();
    try {
      const data = await recetasService.getRecetas({ 
        ...filtros, 
        page: pagination.page, 
        limit: pagination.limit 
      });
      
      set({ 
        recetas: data.data || [], 
        pagination: {
            ...pagination,
            total: data.meta?.total || 0,
            totalPages: data.meta?.totalPages || 1
        },
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Error al cargar recetas' });
    }
  },

  setFiltro: (key, value) => {
    set((state) => ({
      filtros: { ...state.filtros, [key]: value },
      pagination: { ...state.pagination, page: 1 } // Reset to page 1 on filter change
    }));
    get().fetchRecetas();
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page }
    }));
    get().fetchRecetas();
  },

  fetchRecetaDetalle: async (id) => {
    set({ isLoading: true, error: null, recetaActiva: null });
    try {
      const data = await recetasService.getRecetaById(id);
      set({ recetaActiva: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Error al cargar detalle de receta' });
    }
  },
  
  setRecetaActiva: (receta) => {
      set({ recetaActiva: receta });
  },

  guardarGenerada: async (recetaData) => {
    set({ isLoading: true, error: null });
    try {
      const nuevaReceta = await recetasService.guardarReceta(recetaData);
      // Podríamos actualizar el cache o simplemente retornar la nueva receta
      set({ isLoading: false });
      return nuevaReceta;
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Error al guardar receta' });
      throw error;
    }
  },

  enviarCalificacion: async (id, calificaciones) => {
    try {
      const updatedReceta = await recetasService.calificarReceta(id, calificaciones);
      set({ recetaActiva: updatedReceta }); // Actualiza la vista actual
      return updatedReceta;
    } catch (error) {
      console.error('Error al calificar:', error);
      throw error;
    }
  }
}));

export default useRecetasStore;
