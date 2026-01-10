const prisma = require('../config/prisma');

const buildPrompt = async (configuracion, idsPersonas) => {
  // 1. Recuperar Datos de BD
  const personas = await prisma.persona.findMany({
    where: {
      id: { in: idsPersonas }
    }
  });

  const personasMap = personas.map(p => ({
    nombre: p.nombre,
    edad: p.edad,
    gustos: p.gustos,
    disgustos: p.disgustos
  }));

  let ingredientesCercanosList = [];
  if (configuracion.usar_ingredientes_cercanos) {
    const ingredientesCercanos = await prisma.ingredienteLocal.findMany({
      where: { activo: true }
    });
    ingredientesCercanosList = ingredientesCercanos.map(i => i.nombre);
  }

  // TODO: Recuperar historial de recetas gustadas (Future Implementation)

  // 2. Construir Bloque "System Prompt"
  const systemPrompt = `Eres un Chef Ejecutivo experto en nutrición y logística familiar. Tu objetivo es generar 5 recetas detalladas que maximicen la satisfacción del grupo basándote en ingredientes limitados.

REGLAS CRÍTICAS:

1. Solo responde con un objeto JSON válido. No incluyas markdown, introducciones ni texto fuera del JSON.
    
2. Respeta estrictamente las alergias y disgustos de los comensales.
    
3. Prioriza el uso de 'Ingredientes Disponibles en Casa'. Sugiere compras del 'Catálogo Cercano' solo si es estrictamente necesario para completar un plato viable.`;

  // 3. Construir Bloque "Context Injection"
  
  // A. Configuración de la Sesión
  const sessionConfig = `
- Tipo de Comida: [${configuracion.tipo_comida}]
- Nivel Saludable: [${configuracion.nivel_saludable}/5]
- Tiempo Preparación: [${configuracion.tiempo_prep}]
- Objetivo de Agrado: [${configuracion.nivel_agrado}]
- Antojo/Nota del Usuario: "${configuracion.antojo_extra || ''}"
`;

  // B. Perfiles de Comensales
  const profilesJson = JSON.stringify(personasMap, null, 2);

  // C. Inventario
  const inventory = `
- EN CASA: ${configuracion.ingredientes_casa}
- TIENDA CERCANA (Comprable): ${ingredientesCercanosList.join(', ')}
`;

  // 4. Construir Bloque "Output Schema"
  const outputSchema = `
IMPORTANTE: DEBES RESPONDER ÚNICAMENTE CON UN OBJETO JSON VÁLIDO. NO ESCRIBAS NADA ANTES NI DESPUÉS DEL JSON.
USA EXACTAMENTE EL SIGUIENTE FORMATO DE EJEMPLO:

{
  "recetas": [
    {
      "titulo": "Ensalada César con Pollo",
      "descripcion": "Una versión clásica y fresca, ideal para una comida ligera.",
      "tiempo_estimado": "25 min",
      "nivel_saludable_calculado": 4,
      "ingredientes": [
        { "nombre": "Pechuga de pollo", "estado": "tienes", "cantidad": "500g" },
        { "nombre": "Lechuga romana", "estado": "comprar", "cantidad": "1 pieza" },
        { "nombre": "Pan tostado", "estado": "alacena_cercana", "cantidad": "100g" }
      ],
      "pasos": [
        "Lavar y desinfectar la lechuga.",
        "Asar la pechuga de pollo a la plancha.",
        "Mezclar todos los ingredientes en un bowl."
      ],
      "explicacion_decision": "Elegida porque todos los comensales disfrutan del pollo y es rápida de preparar."
    }
  ]
}
`;

  // Concatenar todo en el mensaje final
  // Nota: Al usar modelos de razonamiento como deepseek-reasoner, a veces es mejor poner todo en el user prompt si el system prompt no es soportado separadamente,
  // pero la instrucción dice "Construir Prompt". Lo uniremos todo en un solo string para enviarlo como 'user' message en deepseek.service.js, o separar 'system' si se desea.
  // En deepseek.service.js estamos enviando un solo mensaje 'user'. Así que aquí concatenamos todo.
  
  const finalPrompt = `
${systemPrompt}

DATOS DE CONTEXTO:

**A. Configuración:**
${sessionConfig}

**B. Perfiles:**
${profilesJson}

**C. Inventario:**
${inventory}

${outputSchema}
`;

  return finalPrompt;
};

module.exports = {
  buildPrompt
};
