import { create } from 'zustand';
import ingredientesService from '../services/ingredientesService';

const useIngredientesStore = create((set, get) => ({
  ingredientes: [],
  isLoading: false,
  error: null,

  fetchIngredientes: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await ingredientesService.getAll();
      set({ ingredientes: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Error al cargar ingredientes' });
    }
  },

  addIngrediente: async (nombre) => {
    set({ isLoading: true, error: null });
    try {
      await ingredientesService.create(nombre);
      await get().fetchIngredientes();
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Error al agregar ingrediente' });
      throw error;
    }
  },

  toggleIngrediente: async (id) => {
    const previousIngredientes = get().ingredientes;
    set({
        ingredientes: previousIngredientes.map(i =>
            i.id === id ? { ...i, activo: !i.activo } : i
        )
    });

    try {
      await ingredientesService.toggle(id);
    } catch (error) {
      set({ ingredientes: previousIngredientes, error: 'Error al actualizar ingrediente' });
    }
  },

  deleteIngrediente: async (id) => {
    // Optimistic update
    const previousIngredientes = get().ingredientes;
    set({
        ingredientes: previousIngredientes.filter(i => i.id !== id)
    });

    try {
      await ingredientesService.remove(id);
    } catch (error) {
       set({ ingredients: previousIngredientes, error: 'Error al eliminar ingrediente' });
    }
  }
}));

export default useIngredientesStore;
