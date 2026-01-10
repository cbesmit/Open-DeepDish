import { create } from 'zustand';
import generadorService from '../services/generadorService';

const DEFAULT_CONFIG = {
  personas_ids: [],
  nivel_saludable: 3, // 1-5
  tipo_comida: 'Comida',
  tiempo_prep: 'NORMAL', // RAPIDA, NORMAL, LARGA
  ingredientes_extra: '',
  usar_tiendas: true,
  antojo: '',
  nivel_agrado: 'MAYORIA' // CONSENSO, MAYORIA, EXPERIMENTAL
};

const useGeneradorStore = create((set, get) => ({
  config: { ...DEFAULT_CONFIG },
  recetasGeneradas: [],
  status: 'IDLE', // IDLE, LOADING, SUCCESS, ERROR
  error: null,

  setConfig: (key, value) => {
    set((state) => ({
      config: {
        ...state.config,
        [key]: value
      }
    }));
  },

  resetConfig: () => {
    set({ config: { ...DEFAULT_CONFIG }, status: 'IDLE', error: null, recetasGeneradas: [] });
  },

  generar: async () => {
    set({ status: 'LOADING', error: null });
    try {
      const payload = get().config;
      // Convertir nivel_saludable a string si el backend lo requiere o mantener número
      // El backend espera: personas_ids, nivel_saludable (num), etc.
      
      const response = await generadorService.generarRecetas(payload);
      
      // La respuesta del backend devuelve { "recetas_generadas": [...] }
      const recetas = response.recetas_generadas || response.recetas || [];
      
      set({ recetasGeneradas: recetas, status: 'SUCCESS' });
    } catch (error) {
      console.error("Error generando recetas:", error);
      set({ 
        status: 'ERROR', 
        error: error.response?.data?.error || error.message || 'Error al conectar con el Chef IA.' 
      });
    }
  },

  limpiarResultados: () => {
    set({ status: 'IDLE', recetasGeneradas: [], error: null });
  }
}));

export default useGeneradorStore;
