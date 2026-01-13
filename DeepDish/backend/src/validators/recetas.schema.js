const { z } = require('zod');

// Schema para guardar receta
// "contenido_full" y "config_snapshot" pueden ser cualquier objeto JSON válido,
// usamos .record(z.any()) o .object({}).passthrough() o simplemente .any() para flexibilidad.
const guardarRecetaSchema = z.object({
  titulo: z.string().min(1, "Título es requerido"),
  descripcion: z.string().min(1, "Descripción es requerida"),
  tipo_comida: z.string().min(1, "Tipo de comida es requerido"),
  tiempo_preparacion: z.string().min(1, "Tiempo de preparación es requerido"),
  dificultad: z.string().optional(),
  objetivo_agrado: z.string().optional(),
  tipo_cocina: z.string().optional(),
  nivel_saludable: z.number().int().min(1).max(5),
  contenido_full: z.any().refine(val => val && typeof val === 'object' && !Array.isArray(val), {
    message: "contenido_full debe ser un objeto JSON"
  }),
  config_snapshot: z.any().refine(val => val && typeof val === 'object' && !Array.isArray(val), {
    message: "config_snapshot debe ser un objeto JSON"
  })
});

// Enum para valoración
const ValoracionEnum = z.enum(['ME_GUSTO', 'NO_ME_GUSTO', 'INDIFERENTE']);

// Schema para calificar receta
const calificarRecetaSchema = z.object({
  calificaciones: z.array(
    z.object({
      persona_id: z.string().uuid("ID de persona inválido"),
      valoracion: ValoracionEnum
    })
  ).min(1, "Debe enviar al menos una calificación")
});

module.exports = {
  guardarRecetaSchema,
  calificarRecetaSchema
};
