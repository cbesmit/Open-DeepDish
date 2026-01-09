# 4. Módulos y Requerimientos Funcionales

Esta sección describe el comportamiento detallado del sistema, dividido en módulos lógicos. Cada módulo especifica las interacciones del usuario (Frontend) y las responsabilidades del sistema (Backend).

## 4.1 Módulo de Control de Acceso y Configuración

Dado que el sistema es monousuario, la seguridad se enfoca en restringir el acceso a la red local y evitar el uso no autorizado dentro del hogar.

### RF-01: Autenticación Simplificada

- **Descripción:** El sistema solicitará credenciales únicas al acceder por primera vez.
    
- **Mecanismo:** Validación contra variables de entorno (`APP_USER`, `APP_PASSWORD`) inyectadas en el contenedor del Backend.
    
- **Comportamiento:**
    
    - Si las credenciales son correctas, se genera un Token (JWT o sesión simple) persistente.
        
    - Si son incorrectas, se muestra un mensaje de error genérico.
        

### RF-02: Configuración Global (Environment)

- **Descripción:** El sistema cargará configuraciones base al inicio.
    
- **Datos:** País de residencia (para unidades de medida y disponibilidad de ingredientes), tipos de cocina preferidos y API Keys de la IA.
    

## 4.2 Módulo de Gestión de Comensales (Personas)

Este módulo administra el contexto humano necesario para que la IA tome decisiones empáticas.

### RF-03: Catálogo de Personas (CRUD)

- **Listado:** Vista de tarjetas o tabla con las personas registradas.
    
- **Alta/Edición:** Formulario con los campos:
    
    - Nombre (Texto).
        
    - Edad (Numérico, crucial para porciones y tipo de alimentación).
        
    - Sexo (Opcional).
        
    - **Gustos:** Lista dinámica de texto libre (tags). Ej: "Comida Italiana", "Chocolate".
        
    - **Disgustos/Alergias:** Lista dinámica de texto libre (tags). Ej: "Cebolla cruda", "Camarones".
        
- **Desactivación:** Interruptor (Switch) para marcar una persona como "Inactiva" (no se borra, pero no aparece en el selector del Generador).
    

### RF-04: Detalle y Historial por Persona

- **Vista de Detalle:** Al seleccionar una persona, se muestran sus datos demográficos.
    
- **Historial de Gustos:** Sub-sección que muestra una tabla con las recetas que esta persona ha calificado específicamente como "Me Gustó" o "Indiferente", excluyendo "No me gustó".
    

## 4.3 Módulo de Alacena e Ingredientes Locales

Gestiona la disponibilidad de recursos externos para sugerir compras inteligentes.

### RF-05: Catálogo de Ingredientes Cercanos

- **Descripción:** Lista simple de items que se sabe que se pueden comprar en tiendas aledañas (Ej. "Tortillas de la esquina", "Verduras del mercado los martes").
    
- **Funcionalidad:**
    
    - Agregar/Borrar ítem.
        
    - Activar/Desactivar disponibilidad (Check simple).
        
- **Uso en IA:** Los ingredientes activos se enviarán al prompt como "Ingredientes disponibles para compra rápida".
    

## 4.4 Módulo Generador de Recetas (Core)

El núcleo de la aplicación. Orquesta la entrada de datos, la comunicación con la IA y la presentación de resultados.

### RF-06: Configuración de la Generación (Header)

Interfaz de entrada para definir los parámetros de la solicitud.

- **Selector de Comensales:** Checkbox list de personas activas.
    
- **Nivel Saludable:** Slider o Selector de 1 a 5 (1=Indulgente, 5=Muy Saludable).
    
- **Nivel de Agrado:** Selector de 3 valores:
    
    1. _Consenso Total:_ Debe gustar a todos (más difícil, menos opciones).
        
    2. _Mayoría:_ Prioriza a la mayoría, ignora quejas menores.
        
    3. _Experimental:_ Guste a pocos o sea algo nuevo.
        
- **Horario:** Selector (Desayuno, Comida, Cena).
    
- **Tiempo de Preparación:** Selector (Rápida < 30m, Normal 30-60m, Elaborada > 60m).
    
- **Tipo de Cocina:** Selector con valor por defecto "Mexicana" (o según ENV), pero editable.
    

### RF-07: Contexto de Ingredientes y Antojos

- **"Lo que tengo en casa":** Campo de texto libre grande para listar ingredientes actuales.
    
- **Checkbox "Usar Ingredientes Cercanos":** Si se marca, incluye el listado del módulo 4.3 en el prompt. Si no, la IA se limita estrictamente a "Lo que tengo en casa".
    
- **Texto Libre / Antojo:** Campo para instrucciones naturales. Ej: "Tengo ganas de algo caldoso porque hace frío".
    

### RF-08: Procesamiento y Generación (Backend)

Al hacer clic en "Generar":

1. El Backend recopila perfiles de usuarios seleccionados + historial de sus últimas 20 recetas gustadas + configuración actual.
    
2. Construye un Prompt complejo (detallado en Sección 5).
    
3. Envía solicitud a **DeepSeek Reasoner**.
    
4. Recibe y valida que la respuesta sea un JSON válido.
    
5. Devuelve 5 opciones de recetas al Frontend.
    

### RF-09: Visualización de Resultados Generados

- **Listado Efímero:** Muestra las 5 recetas generadas con Título y Descripción corta.
    
- **Detalle Previo:** Al hacer clic, se expande la información (Ingredientes, Pasos).
    
- **Acciones:**
    
    - _Botón "Volver a Generar":_ Envía un nuevo request incluyendo los títulos de las 5 anteriores como "Negative Constraint" para evitar repetirlas.
        
    - _Botón "Reiniciar":_ Limpia formulario y resultados.
        

## 4.5 Módulo de Detalle de Receta y Feedback

Gestiona la interacción profunda con una receta específica, ya sea recién generada o guardada.

### RF-10: Vista Detallada de Receta

Muestra la información estructurada:

- Título y Descripción.
    
- **Semáforo de Ingredientes:** Lista de ingredientes dividida visualmente en:
    
    - _Tienes:_ (Coincidencia con el texto "Lo que tengo en casa").
        
    - _Comprar:_ (Ingredientes faltantes o del catálogo local).
        
- Pasos de preparación numerados.
    

### RF-11: Guardado y Calificación (Feedback Loop)

- **Botón Guardar:** Almacena la receta en `recetas_guardadas` con el snapshot de la configuración usada.
    
- **Sistema de Calificación:**
    
    - Muestra lista de las personas involucradas en la comida.
        
    - Por cada persona, un selector de 3 estados: `[👍 Me Gustó]`, `[👎 No me gustó]`, `[😐 Indiferente]`.
        
    - **Trigger:** Al guardar las calificaciones, la receta se marca como "Calificada" y entra al historial de gustos para futuros prompts.
        

## 4.6 Módulo de Historial (Recetario)

Repositorio de recetas exitosas con capacidades avanzadas de búsqueda.

### RF-12: Listado de Recetas Guardadas

Tabla o Grid que muestra: Título, Fecha, Tipo de Comida y un resumen visual de a quién le gustó (ej. iconos de avatares).

### RF-13: Filtros Avanzados

El sistema debe permitir combinar los siguientes filtros:

1. **Por Persona:** Dropdown multi-selección. Filtra recetas donde la persona seleccionada tenga calificación `ME_GUSTO` o `INDIFERENTE` (excluye `NO_ME_GUSTO`).
    
2. **Por Fechas:** Rango (Desde - Hasta).
    
3. **Por Ingrediente:** Campo de texto (`%LIKE%` sobre el JSON de ingredientes).
    
4. **Por Título:** Campo de texto (`%LIKE%`).
    
5. **Por Descripción:** Campo de texto (`%LIKE%`).
    
6. **Horario:** (Desayuno/Comida/Cena).
    
7. **Tiempo:** (Rápida/Normal/Larga).
    
8. **Nivel Saludable:** Slider 1-5.
    
9. **Nivel de Agrado (Filtro Calculado):**
    
    - _Todos:_ Recetas donde el 100% de los comensales calificó `ME_GUSTO`.
        
    - _Mayoría:_ Recetas donde > 50% calificó `ME_GUSTO`.
        
    - _Pocos:_ El resto.