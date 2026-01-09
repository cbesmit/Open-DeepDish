# 6. Especificación de API (Backend -> Frontend)

Esta sección documenta los endpoints RESTful expuestos por el Backend (Node.js) para ser consumidos por el Frontend (ReactJS).

**Convenciones Generales:**

- **Base URL:** `/api/v1`
    
- **Content-Type:** `application/json`
    
- **Autenticación:** Header `Authorization: Bearer <token>` (requerido en todos los endpoints excepto `/auth/login`).
    
- **Manejo de Errores:** Todas las respuestas de error siguen el formato `{ "error": true, "message": "Descripción", "code": "ERR_CODE" }`.
    

## 6.1 Autenticación y Sistema

### 6.1.1 Iniciar Sesión

Valida las credenciales hardcodeadas definidas en el `.env`.

- **Método:** `POST`
    
- **Ruta:** `/auth/login`
    
- **Body:**
    
    ```
    {
      "username": "admin",
      "password": "supersecurepassword"
    }
    ```
    
- **Respuesta (200 OK):**
    
    ```
    {
      "token": "eyJhbGciOiJIUz...",
      "expiresIn": 86400
    }
    ```
    

### 6.1.2 Obtener Metadatos (Configuración Global)

Devuelve los catálogos estáticos definidos en variables de entorno para poblar selectores.

- **Método:** `GET`
    
- **Ruta:** `/system/metadata`
    
- **Respuesta (200 OK):**
    
    ```
    {
      "pais_base": "MX",
      "tipos_cocina": ["Mexicana", "Italiana", "Japonesa", "Mediterránea"],
      "horarios": ["Desayuno", "Comida", "Cena"]
    }
    ```
    

## 6.2 Gestión de Personas (Comensales)

### 6.2.1 Listar Personas

Devuelve todas las personas registradas.

- **Método:** `GET`
    
- **Ruta:** `/personas`
    
- **Query Params:** `?activo=true` (Opcional, para filtrar solo activos).
    
- **Respuesta (200 OK):**
    
    ```
    [
      {
        "id": "uuid-1",
        "nombre": "Ana",
        "activo": true,
        "gustos": ["Picante", "Pastas"],
        "disgustos": ["Cebolla"]
      }
    ]
    ```
    

### 6.2.2 Crear Persona

- **Método:** `POST`
    
- **Ruta:** `/personas`
    
- **Body:**
    
    ```
    {
      "nombre": "Luis",
      "edad": 10,
      "sexo": "M",
      "gustos": ["Pizza", "Hamburguesa"],
      "disgustos": ["Verduras"]
    }
    ```
    

### 6.2.3 Actualizar Persona

- **Método:** `PUT`
    
- **Ruta:** `/personas/:id`
    
- **Body:** (Mismo que Crear, campos opcionales).
    

### 6.2.4 Cambiar Estado (Soft Delete/Activar)

- **Método:** `PATCH`
    
- **Ruta:** `/personas/:id/estado`
    
- **Body:** `{ "activo": false }`
    

## 6.3 Ingredientes Cercanos (Catálogo de Compra)

### 6.3.1 Gestión de Ingredientes

Endpoints simplificados para el catálogo local.

- `GET /ingredientes` -> Lista todos.
    
- `POST /ingredientes` -> Body: `{ "nombre": "Tortillas" }`.
    
- `PATCH /ingredientes/:id/toggle` -> Invierte el estado `disponible` (Boolean).
    
- `DELETE /ingredientes/:id` -> Elimina permanentemente.
    

## 6.4 Generador de Recetas (Integración IA)

### 6.4.1 Generar Nuevas Recetas

El endpoint principal. Orquesta la llamada a DeepSeek. Este proceso puede tardar entre 10-30 segundos.

- **Método:** `POST`
    
- **Ruta:** `/generador/crear`
    
- **Body (Configuración de Generación):**
    
    ```
    {
      "personas_ids": ["uuid-1", "uuid-2"],
      "tipo_comida": "Comida",
      "nivel_saludable": 4, // 1-5
      "nivel_agrado": "MAYORIA", // TODOS, MAYORIA, POCOS
      "tiempo_prep": "NORMAL", // RAPIDA, NORMAL, LARGA
      "tipo_cocina": "Mexicana",
      "ingredientes_casa": "Pollo, Arroz, Jitomate", // Texto libre
      "usar_ingredientes_cercanos": true,
      "antojo_extra": "Algo caldoso para el frío"
    }
    ```
    
- Respuesta (200 OK):
    
    Devuelve un array de objetos (no se guardan en BD todavía, solo en memoria/cache temporal o directo al cliente).
    
    ```
    {
      "recetas_generadas": [
        {
          "temp_id": 1, // ID temporal para referencia en frontend
          "titulo": "Caldo Tlalpeño Saludable",
          "descripcion": "Una versión ligera...",
          "ingredientes": [...],
          "pasos": [...],
          "match_explanation": "Ideal para el frío y evita los mariscos que no le gustan a Ana."
        },
        ... // 4 recetas más
      ]
    }
    ```
    

## 6.5 Recetas Guardadas y Historial

### 6.5.1 Guardar Receta Generada

Persiste una receta generada por la IA en la base de datos `recetas_guardadas`.

- **Método:** `POST`
    
- **Ruta:** `/recetas`
    
- Body:
    
    Recibe el objeto JSON completo de la receta seleccionada + el snapshot de configuración.
    
    ```
    {
      "titulo": "Caldo Tlalpeño...",
      "contenido_full": { ...json_receta_ia... },
      "config_snapshot": { ...json_config_request_original... },
      "tipo_comida": "Comida",
      "nivel_saludable": 4
      // etc...
    }
    ```
    

### 6.5.2 Listar Recetas (Filtros Avanzados)

- **Método:** `GET`
    
- **Ruta:** `/recetas`
    
- **Query Params (Filtros):**
    
    - `q`: Búsqueda de texto (título/descripción/ingrediente).
        
    - `persona_id`: UUID para filtrar "le gustó a esta persona".
        
    - `fecha_inicio`, `fecha_fin`: Rango YYYY-MM-DD.
        
    - `nivel_saludable`: 1-5.
        
    - `tiempo`: RAPIDA/NORMAL/LARGA.
        
    - `page`: Paginación (default 1).
        
    - `limit`: Items por página (default 10).
        

### 6.5.3 Detalle de Receta

- **Método:** `GET`
    
- **Ruta:** `/recetas/:id`
    
- **Respuesta:** Incluye el objeto `receta` y un array `calificaciones_actuales`.
    

## 6.6 Calificaciones (Feedback)

### 6.6.1 Calificar Receta

Registra o actualiza la opinión de los usuarios sobre una receta guardada.

- **Método:** `POST`
    
- **Ruta:** `/recetas/:id/calificar`
    
- **Body:**
    
    ```
    {
      "calificaciones": [
        { "persona_id": "uuid-1", "valoracion": "ME_GUSTO" },
        { "persona_id": "uuid-2", "valoracion": "NO_ME_GUSTO" },
        { "persona_id": "uuid-3", "valoracion": "INDIFERENTE" }
      ]
    }
    ```
    
- **Efecto:** Actualiza la tabla pivote `calificaciones`. Si es la primera vez que se califica, la receta pasa a formar parte del contexto histórico de la IA.