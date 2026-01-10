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
  nivel_agrado: 'MAYORIA', // CONSENSO, MAYORIA, EXPERIMENTAL
  tipo_cocina: 'Mexicana' // Default Cuisine
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
      const config = get().config;
      
      // Mapear claves del frontend a lo que espera el backend (según generadorSchema en controller)
      const payload = {
          personas_ids: config.personas_ids,
          tipo_comida: config.tipo_comida,
          nivel_saludable: config.nivel_saludable,
          nivel_agrado: config.nivel_agrado,
          tiempo_prep: config.tiempo_prep,
          ingredientes_casa: config.ingredientes_extra, // Map frontend 'ingredientes_extra' to backend 'ingredientes_casa'
          usar_ingredientes_cercanos: config.usar_tiendas, // Map frontend 'usar_tiendas' to backend 'usar_ingredientes_cercanos'
          antojo_extra: config.antojo, // Map frontend 'antojo' to backend 'antojo_extra'
          tipo_cocina: config.tipo_cocina
      };
      
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
