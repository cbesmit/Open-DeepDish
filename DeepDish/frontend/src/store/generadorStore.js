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
  historialTitulos: [], // Guardar títulos ya generados para evitar repeticiones
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
    set({ 
        config: { ...DEFAULT_CONFIG }, 
        status: 'IDLE', 
        error: null, 
        recetasGeneradas: [],
        historialTitulos: []
    });
  },

  generar: async (esReintento = false) => {
    set({ status: 'LOADING', error: null });
    try {
      const config = get().config;
      const historial = get().historialTitulos;
      
      const payload = {
          personas_ids: config.personas_ids,
          tipo_comida: config.tipo_comida,
          nivel_saludable: config.nivel_saludable,
          nivel_agrado: config.nivel_agrado,
          tiempo_prep: config.tiempo_prep,
          ingredientes_casa: config.ingredientes_extra,
          usar_ingredientes_cercanos: config.usar_tiendas,
          antojo_extra: config.antojo,
          tipo_cocina: config.tipo_cocina,
          // Mandamos el historial si es un reintento/regeneración
          historial_recetas: esReintento ? historial : []
      };
      
      const response = await generadorService.generarRecetas(payload);
      const nuevasRecetas = response.recetas_generadas || response.recetas || [];
      
      // Actualizar historial con los nuevos títulos
      const nuevosTitulos = nuevasRecetas.map(r => `${r.titulo}: ${r.descripcion}`);

      set((state) => ({ 
        recetasGeneradas: nuevasRecetas, 
        historialTitulos: [...state.historialTitulos, ...nuevosTitulos],
        status: 'SUCCESS' 
      }));
    } catch (error) {
      console.error("Error generando recetas:", error);
      set({ 
        status: 'ERROR', 
        error: error.response?.data?.error || error.message || 'Error al conectar con el Chef IA.' 
      });
    }
  },

  limpiarResultados: () => {
    // Solo limpia resultados para volver al form, pero mantiene historial si se desea
    set({ status: 'IDLE', recetasGeneradas: [], error: null });
  }
}));

export default useGeneradorStore;
