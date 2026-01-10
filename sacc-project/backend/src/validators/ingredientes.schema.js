const { z } = require('zod');

const ingredienteSchema = z.object({
  nombre: z.string().min(1, "El nombre del ingrediente es obligatorio")
});

module.exports = {
  ingredienteSchema
};
