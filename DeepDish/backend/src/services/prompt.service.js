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

  // Mapeos de Texto Descriptivo para el Prompt
  const mapSalud = (val) => {
      const v = parseInt(val) || 3;
      if (v <= 1) return "1/5 (Indulgente): Sabor sobre todo. Grasas, frituras y azúcares permitidos sin restricción. Comida reconfortante.";
      if (v === 2) return "2/5 (Casero Normal): Comida rica pero con moderación en grasas saturadas.";
      if (v === 3) return "3/5 (Balanceado): El punto medio ideal. Sano pero sabroso. Equilibrio entre proteínas, carbohidratos y grasas.";
      if (v === 4) return "4/5 (Fit/Ligero): Priorizar proteínas magras, verduras y reducir carbohidratos simples.";
      if (v === 5) return "5/5 (Muy Saludable): Estrictamente bajo en calorías, muchas verduras, nada de procesados ni azúcar.";
      return "Balanceado";
  };

  const mapComida = (val) => {
      if (val === 'Desayuno') return "Desayuno Mexicano: Primera comida del día. Puede ser sustanciosa (ej. huevos, chilaquiles) pero adecuada para la mañana.";
      if (val === 'Comida') return "Comida (Almuerzo) en México: La comida principal y más fuerte del día (aprox 2-4 PM). Debe ser un plato completo y saciante.";
      if (val === 'Cena') return "Cena: Última comida del día. Generalmente se busca algo más ligero que la comida principal para dormir bien, pero nutritivo.";
      return val;
  };

  const mapTiempo = (val) => {
      if (val === 'RAPIDA') return "Rápida: Menos de 30 min. Preparación sencilla, pocos pasos, ideal para cuando hay prisa.";
      if (val === 'NORMAL') return "Normal: 30 a 60 min. Elaboración estándar casera.";
      if (val === 'LARGA') return "Larga/Elaborada: Más de 60 min. Platillos complejos que requieren dedicación (ej. horneados largos, guisos lentos).";
      return val;
  };

  const mapAgrado = (val) => {
      if (val === 'CONSENSO') return "Consenso Total: La receta DEBE gustar a TODOS los comensales seleccionados sin excepción. Evita cualquier ingrediente que desagrade a alguien.";
      if (val === 'MAYORIA') return "Prioridad Mayoría: Busca satisfacer a la mayor cantidad de personas posible, aunque uno pueda no estar del todo convencido (democracia culinaria).";
      if (val === 'EXPERIMENTAL') return "Experimental: Prioriza la novedad o sabores interesantes sobre la seguridad de que les guste a todos. Arriésgate un poco.";
      return "Satisfacer a la mayoría.";
  };

  // 2. Construir Bloque "System Prompt"
  const systemPrompt = `Eres un Chef Ejecutivo experto en nutrición y logística familiar. Tu objetivo es generar 8 recetas detalladas que maximicen la satisfacción del grupo basándote en ingredientes limitados y el contexto cultural de México.

REGLAS CRÍTICAS:

1. Solo responde con un objeto JSON válido. No incluyas markdown, introducciones ni texto fuera del JSON.
    
2. Respeta estrictamente las alergias y disgustos de los comensales según el "Objetivo de Agrado".
    
3. Prioriza el uso de 'Ingredientes Disponibles en Casa'. Sugiere compras del 'Catálogo Cercano' solo si es estrictamente necesario para completar un plato viable.

4. RESTRICCIÓN NEGATIVA: NO generes ninguna de las siguientes recetas que ya han sido propuestas anteriormente:
${(configuracion.historial_recetas || []).map(r => `- ${r}`).join('\n')}`;

  // 3. Construir Bloque "Context Injection"
  
  // A. Configuración de la Sesión
  const sessionConfig = `
- Tipo de Comida (Contexto): ${mapComida(configuracion.tipo_comida)}
- Nivel Saludable: ${mapSalud(configuracion.nivel_saludable)}
- Complejidad/Tiempo: ${mapTiempo(configuracion.tiempo_prep)}
- Objetivo de Agrado: ${mapAgrado(configuracion.nivel_agrado)}
- Tipo de Cocina Preferida: ${configuracion.tipo_cocina || 'Mexicana'}
- Antojo/Nota del Usuario: "${configuracion.antojo_extra || ''}"
`;

  // B. Perfiles de Comensales
  const profilesJson = JSON.stringify(personasMap, null, 2);

  // C. Inventario
  const inventory = `
- EN CASA (Prioridad Alta): ${configuracion.ingredientes_casa}
- TIENDA CERCANA (Disponible para compra): ${ingredientesCercanosList.join(', ')}
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
  // La instrucción dice "Construir Prompt". Lo uniremos todo en un solo string para enviarlo como 'user' message en openai.service.js.
  
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
