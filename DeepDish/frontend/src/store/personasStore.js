import { create } from 'zustand';
import personasService from '../services/personasService';

const usePersonasStore = create((set, get) => ({
  personas: [],
  isLoading: false,
  error: null,

  fetchPersonas: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await personasService.getAll();
      set({ personas: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Error al cargar personas' });
    }
  },

  addPersona: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await personasService.create(data);
      // Refetch to ensure consistency or push to array
      await get().fetchPersonas();
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Error al crear persona' });
      throw error;
    }
  },

  updatePersona: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await personasService.update(id, data);
      await get().fetchPersonas();
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Error al actualizar persona' });
      throw error;
    }
  },

  togglePersona: async (id, nuevoEstado) => {
    // Optimistic update
    const previousPersonas = get().personas;
    set({
      personas: previousPersonas.map(p => 
        p.id === id ? { ...p, activo: nuevoEstado } : p
      )
    });

    try {
      await personasService.toggleEstado(id, nuevoEstado);
    } catch (error) {
      // Revert on error
      set({ personas: previousPersonas, error: 'Error al cambiar estado' });
    }
  }
}));

export default usePersonasStore;
