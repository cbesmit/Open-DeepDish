# 1. Introducción y Visión del Proyecto

## 1.1 Propósito del Documento

El propósito de este documento es definir detalladamente los requerimientos funcionales, no funcionales y la arquitectura técnica para el desarrollo del **Sistema de Asistencia Culinaria Contextual (SACC)**. Este proyecto tiene como objetivo resolver la problemática diaria de la planificación de comidas en un entorno familiar, utilizando Inteligencia Artificial Generativa (DeepSeek Reasoner) para crear menús hiper-personalizados que consideren restricciones dietéticas, inventario actual, gustos históricos y dinámicas sociales del hogar.

## 1.2 Visión del Producto

La visión es crear una aplicación web unificada y contenerizada que actúe como un "Chef Ejecutivo Inteligente" para el hogar. A diferencia de los recetarios tradicionales estáticos, este sistema es **contextual y evolutivo**:

- **Contextual:** Entiende quién va a comer, qué ingredientes existen físicamente en la cocina y qué ingredientes se pueden adquirir en el entorno inmediato.
    
- **Evolutivo:** Aprende de las decisiones pasadas mediante un historial de recetas "gustadas" o "rechazadas", refinando los prompts enviados a la IA para mejorar la tasa de éxito de las sugerencias futuras.
    

El sistema busca maximizar la satisfacción grupal (agrado de los comensales) mientras se balancean variables críticas como el nivel de salud nutricional y el tiempo disponible para la preparación.

## 1.3 Objetivos del Proyecto

### 1.3.1 Objetivo General

Desarrollar una aplicación "Full Stack" desplegable mediante Docker Compose que integre ReactJS, Node.js y PostgreSQL, capaz de orquestar consultas complejas a un modelo de lenguaje (LLM) para generar recetas de cocina viables y satisfactorias.

### 1.3.2 Objetivos Específicos

1. **Centralización de Perfiles:** Digitalizar los gustos, disgustos y restricciones de cada miembro del hogar en una base de datos relacional.
    
2. **Optimización de Inventario:** Priorizar el uso de ingredientes existentes (anti-desperdicio) e identificar ingredientes faltantes accesibles localmente.
    
3. **Generación Inteligente:** Utilizar DeepSeek Reasoner para procesar lógica difusa (ej. "algo rápido y saludable para 3 personas, pero que le guste al niño que odia la cebolla") y devolver resultados estructurados (JSON).
    
4. **Gestión de Conocimiento (Feedback Loop):** Implementar un sistema de retroalimentación donde el usuario califica el éxito de una receta, alimentando el contexto de futuras generaciones.
    
5. **Aislamiento y Seguridad:** Garantizar que toda la lógica de negocio y datos residan en una red privada de Docker, exponiendo únicamente la interfaz de usuario.
    

## 1.4 Alcance (Scope)

### 1.4.1 Incluido (In-Scope)

- **Autenticación:** Login simplificado (Hardcoded) para un entorno monousuario seguro.
    
- **Gestión de Entidades:** CRUD completo para Personas, Ingredientes Locales y Recetas.
    
- **Motor de Filtros Avanzados:** Búsqueda por coincidencia de texto (LIKE), rangos de fechas, niveles de salud y etiquetas de tiempo de preparación.
    
- **Integración IA:** Comunicación vía API con DeepSeek, incluyendo ingeniería de prompts dinámica basada en el historial de base de datos.
    
- **Persistencia:** Almacenamiento de recetas generadas, logs de auditoría de gustos por persona y configuraciones de generación.
    
- **Interfaz Responsiva:** Diseño web adaptado para visualización en escritorio y dispositivos móviles (uso en cocina).
    

### 1.4.2 Excluido (Out-of-Scope)

- **Gestión Multi-Tenant:** El sistema está diseñado para un solo administrador/hogar.
    
- **E-commerce:** No se contempla la compra automática de ingredientes en tiendas en línea.
    
- **Red Social:** No habrá funcionalidades para compartir recetas públicamente con otros usuarios fuera del entorno local.
    
- **Reconocimiento de Imágenes:** No se escanearán ingredientes mediante cámara; la entrada es texto.
    

## 1.5 Usuarios y Partes Interesadas

- **Administrador del Hogar (Usuario Principal):** Persona encargada de la planificación y preparación de alimentos. Tiene control total sobre la configuración, perfiles y decisión final sobre qué receta preparar.
    
- **Comensales (Entidades Pasivas):** Personas registradas en el sistema cuyos gustos influyen en el algoritmo, pero que no interactúan directamente con la interfaz.
    

## 1.6 Premisas y Restricciones Técnicas

- **Contenerización:** La aplicación debe funcionar al 100% dentro de un entorno Docker Compose.
    
- **Conectividad:** El servidor requiere acceso a internet para consumir la API de DeepSeek.
    
- **Modelo de IA:** Se priorizará el modelo `deepseek-reasoner` por su capacidad de cadena de pensamiento (CoT) para resolver conflictos de gustos entre múltiples personas.
    
- **Base de Datos:** PostgreSQL como fuente única de verdad para datos estructurados y JSONB para metadatos flexibles de recetas.
    
- **Idiomas y Localización:** Configurable mediante variables de entorno (País base para unidades de medida y disponibilidad de ingredientes, Tipos de cocina preferidos).