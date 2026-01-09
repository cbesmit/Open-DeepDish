# 5. Estrategia de Integración con IA (DeepSeek)

Esta sección detalla la ingeniería de prompts, el manejo de contexto y el flujo técnico para comunicar el Backend (Node.js) con la API de DeepSeek (`deepseek-reasoner`), garantizando respuestas estructuradas y útiles.

## 5.1 Selección del Modelo

Se utilizará el modelo **DeepSeek Reasoner** (modelo de razonamiento).

- **Justificación:** A diferencia de modelos de chat estándar, los modelos de razonamiento (Chain of Thought) son superiores resolviendo problemas de satisfacción de restricciones múltiples (Constraint Satisfaction Problems).
    
- **Caso de Uso:** El sistema debe balancear variables contradictorias (ej. "Usuario A odia la cebolla", "Usuario B ama la cebolla", "Solo hay cebollas en la alacena") y deducir una solución culinaria creativa (ej. "Usar cebolla entera para dar sabor al caldo y retirarla antes de servir").
    

## 5.2 Arquitectura del Prompt

El prompt se construirá dinámicamente en Node.js concatenando varios bloques de texto. No se enviará un simple mensaje, sino una estructura rígida para asegurar un JSON válido.

### 5.2.1 System Prompt (Instrucción Base)

Define el rol y las reglas inquebrantables.

> "Eres un Chef Ejecutivo experto en nutrición y logística familiar. Tu objetivo es generar 5 recetas detalladas que maximicen la satisfacción del grupo basándote en ingredientes limitados.
> 
> REGLAS CRÍTICAS:
> 
> 1. Solo responde con un objeto JSON válido. No incluyas markdown, introducciones ni texto fuera del JSON.
>     
> 2. Respeta estrictamente las alergias y disgustos de los comensales.
>     
> 3. Prioriza el uso de 'Ingredientes Disponibles en Casa'. Sugiere compras del 'Catálogo Cercano' solo si es estrictamente necesario para completar un plato viable."
>     

### 5.2.2 Context Injection (Inyección de Datos)

El Backend inyectará los siguientes bloques de datos en el mensaje del usuario:

**A. Configuración de la Sesión:**

```
- Tipo de Comida: [Cena]
- Nivel Saludable: [4/5]
- Tiempo Preparación: [Rápida]
- Objetivo de Agrado: [Gustar a la Mayoría]
- Antojo/Nota del Usuario: "Algo caldoso para el frío"
```

**B. Perfiles de Comensales (JSON minificado):**

```
[
  { "nombre": "Ana", "edad": 30, "gustos": ["Picante"], "disgustos": ["Mariscos"] },
  { "nombre": "Luis", "edad": 5, "gustos": ["Dulce"], "disgustos": ["Verduras amargas"] }
]
```

**C. Inventario:**

```
- EN CASA: Pollo, arroz, zanahorias, limones.
- TIENDA CERCANA (Comprable): Tortillas, Aguacate, Queso.
```

D. Historial de Recetas (Contexto de Aprendizaje):

Se enviarán los títulos y calificaciones de las últimas 20 recetas guardadas para afinar el estilo.

```
HISTORIAL RECIENTE:
- "Tacos Dorados" (Ana: Me Gustó, Luis: Indiferente) -> [EXITO]
- "Sopa de Mariscos" (Ana: No me gustó) -> [EVITAR ESTILO]
```

### 5.2.3 Output Schema Enforcement (Formato de Salida)

Para garantizar que el Frontend (React) no se rompa, se instruirá explícitamente el esquema JSON esperado en el prompt:

> "Genera un JSON con la siguiente estructura exacta:"

```
{
  "recetas": [
    {
      "titulo": "String",
      "descripcion": "String corto",
      "tiempo_estimado": "String (ej. 20 min)",
      "nivel_saludable_calculado": Entero (1-5),
      "ingredientes": [
        { "nombre": "String", "estado": "tienes" | "comprar" | "alacena_cercana", "cantidad": "String" }
      ],
      "pasos": ["String", "String"],
      "explicacion_decision": "Breve texto de por qué esta receta cumple con los gustos de Ana y Luis."
    }
  ]
}
```

## 5.3 Gestión de Tokens y Costos

Dado que el historial puede crecer indefinidamente, el Backend implementará una ventana deslizante:

1. **Límite Duro:** Máximo 20 recetas pasadas en el prompt.
    
2. **Optimización:** Solo se envían campos clave (`titulo`, `calificaciones_resumen`) del historial, no el contenido completo de la receta antigua.
    
3. **Presupuesto:** Se estiman ~2k tokens de entrada y ~1k tokens de salida por generación.
    

## 5.4 Flujo Técnico (Backend -> API)

El servicio de Node.js ejecutará la siguiente lógica:

1. **Construcción:** Recopila datos de DB y arma el string del prompt.
    
2. **Llamada:** `POST https://api.deepseek.com/v1/chat/completions`
    
    - `model`: `deepseek-reasoner`
        
    - `temperature`: `0.7` (Creatividad balanceada).
        
    - `response_format`: `{ type: "json_object" }` (Si la API lo soporta nativamente, si no, se fuerza vía prompt).
        
3. **Sanitización:**
    
    - Recibe el string de respuesta.
        
    - Limpia posibles bloques de código Markdown (`json ...` ).
        
    - `JSON.parse()` dentro de un bloque `try/catch`.
        
4. **Validación:** Usa una librería como `Zod` para validar que el JSON tenga los campos requeridos (`titulo`, `pasos`, etc.) antes de enviarlo al Frontend.
    
5. **Fallback:** Si el JSON es inválido, el Backend realiza un "Auto-Retry" (máximo 1 vez) pidiendo a la IA que corrija el formato.
    

## 5.5 Manejo de Errores

- **DeepSeek API Down/Timeout:** Retornar error 503 al Frontend ("El Chef está pensando demasiado, intenta de nuevo").
    
- **Alucinaciones (Hallucinations):** Si la IA inventa ingredientes que no están en la lista "En Casa" ni en "Tienda Cercana", se marcarán visualmente en el UI como "No identificados/Comprar".