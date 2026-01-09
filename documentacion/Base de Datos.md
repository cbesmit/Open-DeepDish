# 3. Diseño de Base de Datos (Modelo Entidad-Relación)

## 3.1 Concepto General

El diseño de la base de datos se centra en la flexibilidad y el rendimiento. Dado que las recetas son generadas por Inteligencia Artificial y pueden variar en estructura, utilizaremos una aproximación híbrida:

1. **Columnas Relacionales (SQL Clásico):** Para datos estructurados que requieren filtros rápidos (fechas, títulos, niveles de salud, IDs).
    
2. **Columnas Documentales (JSONB):** Para almacenar la riqueza de datos generados por la IA (listas de ingredientes, pasos de preparación, metadatos complejos) y las listas de preferencias de usuario.
    

## 3.2 Diagrama Entidad-Relación (ERD)

```
erDiagram
    PERSONAS ||--o{ CALIFICACIONES : "realiza"
    RECETAS_GUARDADAS ||--o{ CALIFICACIONES : "recibe"
    INGREDIENTES_LOCALES

    PERSONAS {
        uuid id PK
        string nombre
        int edad
        string sexo
        jsonb preferencias_gustos "Array texto libre"
        jsonb preferencias_disgustos "Array texto libre"
        boolean activo
    }

    RECETAS_GUARDADAS {
        uuid id PK
        string titulo
        text descripcion
        string tipo_comida "Desayuno, Comida, Cena"
        int nivel_saludable "1-5"
        string nivel_tiempo "Rapida, Normal, Larga"
        jsonb contenido_receta "Detalle completo (Ingredientes, Pasos)"
        jsonb snapshot_configuracion "Configuración usada al generar"
        timestamp fecha_creacion
        boolean eliminada "Soft Delete"
    }

    CALIFICACIONES {
        uuid id PK
        uuid persona_id FK
        uuid receta_id FK
        enum estado "ME_GUSTO, NO_ME_GUSTO, INDIFERENTE"
        timestamp fecha
    }

    INGREDIENTES_LOCALES {
        serial id PK
        string nombre
        boolean disponible
    }
```

## 3.3 Definición Detallada de Tablas

### 3.3.1 Tabla `personas`

Almacena el perfil de los comensales. Usamos `JSONB` para los gustos/disgustos para permitir listas dinámicas de texto libre sin crear tablas auxiliares infinitas.

|   |   |   |   |
|---|---|---|---|
|**Campo**|**Tipo**|**Restricción**|**Descripción**|
|`id`|UUID|PK, Default `gen_random_uuid()`|Identificador único.|
|`nombre`|VARCHAR(100)|NOT NULL|Nombre del comensal.|
|`edad`|INTEGER|NOT NULL|Edad (relevante para el prompt de IA).|
|`sexo`|VARCHAR(20)||Dato demográfico opcional.|
|`gustos`|JSONB|Default `[]`|Lista de comidas/ingredientes favoritos. Ej: `["Picante", "Pollo"]`.|
|`disgustos`|JSONB|Default `[]`|Lista de restricciones/rechazos. Ej: `["Cebolla", "Mariscos"]`.|
|`activo`|BOOLEAN|Default `true`|Para desactivar personas temporalmente (ej. visitas que ya no están).|
|`created_at`|TIMESTAMP|Default `now()`|Fecha de registro.|

### 3.3.2 Tabla `recetas_guardadas`

Esta es la tabla central. Almacena las recetas que el usuario decide guardar después de generarlas.

Nota: Se extraen columnas clave (nivel_saludable, tipo_comida) fuera del JSON para permitir filtros SQL rápidos y eficientes.

|   |   |   |
|---|---|---|
|**Campo**|**Tipo**|**Descripción**|
|`id`|UUID|Identificador único de la receta.|
|`titulo`|VARCHAR(255)|Título generado por la IA. Indexado para búsquedas `%LIKE%`.|
|`descripcion`|TEXT|Breve resumen de la receta. Indexado para búsquedas `%LIKE%`.|
|`tipo_comida`|VARCHAR(50)|Filtro: 'DESAYUNO', 'COMIDA', 'CENA'.|
|`nivel_saludable`|INTEGER|Filtro: Escala 1 a 5.|
|`tiempo_preparacion`|VARCHAR(50)|Filtro: 'RAPIDA', 'NORMAL', 'LARGA'.|
|`contenido_full`|JSONB|**El corazón de la receta.** Contiene el JSON puro devuelto por la IA (ingredientes detallados, pasos, tips). Ver estructura 3.4.|
|`config_snapshot`|JSONB|Copia de los parámetros usados para generar esta receta (qué personas se seleccionaron, qué antojo se escribió).|
|`fecha_guardado`|TIMESTAMP|Para filtro por rangos de fecha.|
|`deleted_at`|TIMESTAMP|NULL por defecto. Si tiene fecha, se considera borrada (Soft Delete).|

### 3.3.3 Tabla `calificaciones` (Historial de Gustos)

Tabla pivote que relaciona quién calificó qué receta y cómo. Es fundamental para el filtro "A quién le gustó".

|   |   |   |
|---|---|---|
|**Campo**|**Tipo**|**Descripción**|
|`id`|UUID|Identificador de la calificación.|
|`receta_id`|UUID|FK hacia `recetas_guardadas`.|
|`persona_id`|UUID|FK hacia `personas`.|
|`valoracion`|ENUM|Valores: `'ME_GUSTO'`, `'NO_ME_GUSTO'`, `'INDIFERENTE'`.|
|`updated_at`|TIMESTAMP|Fecha de la última modificación de la calificación.|

### 3.3.4 Tabla `ingredientes_locales`

Catálogo simple para gestión de alacena y compras cercanas.

|   |   |   |
|---|---|---|
|**Campo**|**Tipo**|**Descripción**|
|`id`|SERIAL|Identificador auto-incremental.|
|`nombre`|VARCHAR(150)|Nombre del ingrediente (ej. "Tortillas de maíz").|
|`activo`|BOOLEAN|Indica si se puede comprar actualmente o si se debe ignorar.|

## 3.4 Estructura del Objeto JSONB (`contenido_full`)

Para garantizar que el Frontend pueda renderizar la receta correctamente, la IA deberá devolver (y la BD almacenará) la siguiente estructura JSON en la columna `recetas_guardadas.contenido_full`:

```
{
  "ingredientes": [
    { "nombre": "Pollo", "cantidad": "500g", "estado": "comprar" },
    { "nombre": "Sal", "cantidad": "al gusto", "estado": "alacena" }
  ],
  "pasos": [
    "Lavar el pollo.",
    "Cortar las verduras en julianas."
  ],
  "tiempo_estimado_minutos": 45,
  "calorias_aprox": 350,
  "tips_chef": "Usa fuego lento para mantener jugosidad."
}
```

## 3.5 Estrategia de Índices y Búsqueda

Para cumplir con los requerimientos de filtros rápidos y búsquedas de texto abierto (`%LIKE%`), se implementarán los siguientes índices en PostgreSQL:

1. **Índice Trigram (pg_trgm):** Fundamental para búsquedas de texto eficientes (`%texto%`) en `titulo` y `descripcion`.
    
    - `CREATE INDEX idx_recetas_titulo_trgm ON recetas_guardadas USING gin (titulo gin_trgm_ops);`
        
2. **Índice GIN para JSONB:** Para buscar dentro de los ingredientes de la receta (ej. buscar todas las recetas que lleven "pollo").
    
    - `CREATE INDEX idx_recetas_contenido ON recetas_guardadas USING gin (contenido_full);`
        
3. **Índices B-Tree:** Para los filtros exactos y de rango.
    
    - `fecha_guardado` (para rangos de fechas).
        
    - `nivel_saludable` (para ordenamiento y filtro).