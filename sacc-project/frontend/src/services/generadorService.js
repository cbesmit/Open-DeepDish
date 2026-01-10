import api from './api';

const generadorService = {
  generarRecetas: async (configuracion) => {
    // El backend espera un POST a /generador/crear
    const response = await api.post('/generador/crear', configuracion);
    return response.data; // Se espera { recetas: [...] } o similar según especificación
  }
};

export default generadorService;
