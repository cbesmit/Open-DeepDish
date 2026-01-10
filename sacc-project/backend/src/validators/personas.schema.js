const { z } = require('zod');

const personaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  edad: z.number().positive("La edad debe ser un número positivo"),
  sexo: z.string().optional(),
  gustos: z.array(z.string()).optional().default([]),
  disgustos: z.array(z.string()).optional().default([])
});

const estadoPersonaSchema = z.object({
  activo: z.boolean({ required_error: "El campo activo es requerido y debe ser booleano" })
});

module.exports = {
  personaSchema,
  estadoPersonaSchema
};
