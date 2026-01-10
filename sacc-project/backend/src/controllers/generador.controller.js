const promptService = require('../services/prompt.service');
const deepseekService = require('../services/deepseek.service');
const { z } = require('zod');

// Schema básico de validación para el generador
const generadorSchema = z.object({
  personas_ids: z.array(z.string()).min(1, "Debe seleccionar al menos una persona"),
  tipo_comida: z.string().optional(),
  nivel_saludable: z.number().min(1).max(5).optional(),
  nivel_agrado: z.string().optional(),
  tiempo_prep: z.string().optional(),
  ingredientes_casa: z.string().optional(),
  usar_ingredientes_cercanos: z.boolean().optional(),
  antojo_extra: z.string().optional()
});

const generarRecetas = async (req, res) => {
  try {
    // 1. Validar entrada
    const configuracion = generadorSchema.parse(req.body);
    const { personas_ids } = configuracion;

    // 2. Construir Prompt
    console.log('[Generador] Construyendo prompt para', personas_ids.length, 'personas...');
    const prompt = await promptService.buildPrompt(configuracion, personas_ids);

    // 3. Llamar a DeepSeek AI
    console.log('[Generador] Enviando petición a DeepSeek...');
    const recetasGeneradas = await deepseekService.callDeepSeekAPI(prompt);

    // 4. Retornar respuesta
    // La spec dice que devolvemos: { "recetas_generadas": [...] }
    // El output de deepseek tiene formato { "recetas": [...] } según el prompt.
    // Mapeamos para cumplir la spec si es necesario, o devolvemos directo.
    // Spec 6.4.1 dice response: { "recetas_generadas": [ ... ] }
    
    const respuestaFinal = {
      recetas_generadas: recetasGeneradas.recetas || []
    };

    // Añadimos IDs temporales si no vienen
    respuestaFinal.recetas_generadas = respuestaFinal.recetas_generadas.map((r, index) => ({
      temp_id: index + 1,
      ...r
    }));

    return res.status(200).json(respuestaFinal);

  } catch (error) {
    console.error('[Generador Controller] Error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: true,
        message: 'Datos de configuración inválidos',
        details: error.errors,
        code: 'VAL_ERROR'
      });
    }

    if (error.message.includes('DEEPSEEK_API_KEY') || error.message.includes('Timeout') || error.message.includes('503')) {
      return res.status(503).json({
        error: true,
        message: 'El Chef IA no está disponible en este momento. Intenta de nuevo.',
        code: 'IA_SERVICE_UNAVAILABLE'
      });
    }

    return res.status(500).json({
      error: true,
      message: 'Error interno al generar recetas',
      code: 'GEN_ERROR'
    });
  }
};

module.exports = {
  generarRecetas
};
