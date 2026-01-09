# 2. Arquitectura del Sistema y Stack Tecnológico

## 2.1 Arquitectura de Alto Nivel

El sistema **SACC** (Sistema de Asistencia Culinaria Contextual) sigue una arquitectura monolítica distribuida en contenedores (Microservices-ready). Todos los componentes residen dentro de un entorno orquestado por **Docker Compose**, lo que garantiza la portabilidad y la facilidad de despliegue en cualquier servidor o máquina local.

La arquitectura se divide en tres capas lógicas principales encapsuladas en servicios independientes:

1. **Capa de Presentación (Frontend):** Responsable de la interacción con el usuario. Es el único punto de entrada público.
    
2. **Capa de Lógica de Negocio (Backend):** Procesa las solicitudes, gestiona la sesión, se comunica con la Base de Datos y actúa como proxy/orquestador hacia la API de Inteligencia Artificial.
    
3. **Capa de Persistencia (Base de Datos):** Almacena de forma relacional y estructurada la información del sistema.
    

### 2.1.1 Diagrama de Flujo de Datos

```
graph TD
    User[Usuario / Navegador] -- Puerto 80/3000 --> Frontend[Contenedor: ReactJS]
    Frontend -- Red Interna Docker --> Backend[Contenedor: Node.js API]
    Backend -- Red Interna Docker --> DB[(Contenedor: PostgreSQL)]
    Backend -- HTTPS (Internet) --> DeepSeek[API Externa: DeepSeek Reasoner]
```

## 2.2 Stack Tecnológico Seleccionado

### 2.2.1 Frontend (Cliente)

- **Framework:** **ReactJS**. Se utilizará **Vite** como empaquetador por su velocidad y eficiencia en desarrollo.
    
- **Lenguaje:** JavaScript (ES6+) / TypeScript (Opcional, recomendado para interfaces de datos estrictas).
    
- **Estilos:** **Tailwind CSS**. Permite un diseño rápido y responsivo sin salir del JSX/TSX.
    
- **Estado y Peticiones:** `Context API` o `Zustand` para el manejo de estado global (sesión, configuración actual) y `Axios` para la comunicación HTTP con el backend.
    
- **Routing:** `React Router DOM` para la navegación SPA (Single Page Application).
    

### 2.2.2 Backend (Servidor)

- **Entorno:** **Node.js** (LTS).
    
- **Framework:** **Express.js**. Ligero y robusto para crear endpoints RESTful.
    
- **ORM/Query Builder:** **Prisma** o **Sequelize**. Se recomienda Prisma por su tipado fuerte y facilidad de migración con PostgreSQL.
    
- **Autenticación:** Middleware personalizado para validación de credenciales "hardcoded" (JWT simple o sesión básica), dado que es monousuario.
    
- **Validación:** `Zod` o `Joi` para validar los payloads de entrada y asegurar que la IA reciba datos limpios.
    

### 2.2.3 Base de Datos

- **Motor:** **PostgreSQL** (Versión 15+).
    
- **Justificación:** Excelente manejo de datos relacionales (Usuarios <-> Recetas) y soporte nativo superior para campos **JSONB**, lo cual es crítico para guardar estructuras flexibles devueltas por la IA (instrucciones paso a paso, listas de ingredientes variables) sin necesidad de normalizar excesivamente.
    

### 2.2.4 Inteligencia Artificial

- **Proveedor:** DeepSeek API.
    
- **Modelo:** `deepseek-reasoner`.
    
- **Función:** Generación de contenido creativo basado en lógica compleja (Chain of Thought) y restricciones estrictas.
    

## 2.3 Estrategia de Contenerización (Docker)

El archivo `docker-compose.yml` definirá la infraestructura completa. Se utilizará una red interna (`bridge`) para aislar el backend y la base de datos del mundo exterior.

### 2.3.1 Definición de Servicios

1. **`db` (PostgreSQL):**
    
    - **Imagen:** `postgres:15-alpine`.
        
    - **Volumen:** Un volumen nombrado (`postgres_data`) montado en `/var/lib/postgresql/data` para persistencia de datos entre reinicios del contenedor.
        
    - **Puertos:** No expuestos al host (solo accesible por `backend` en puerto 5432).
        
2. **`backend` (Node API):**
    
    - **Imagen:** `node:20-alpine` (Construida desde `Dockerfile` local).
        
    - **Dependencias:** Espera a que `db` esté saludable (`depends_on` con `condition: service_healthy`).
        
    - **Variables de Entorno:** Inyectadas desde archivo `.env` (Credenciales DB, API Key DeepSeek, Credenciales App).
        
    - **Puertos:** No expuestos al host (solo accesible por `frontend` en puerto interno, ej. 4000).
        
3. **`frontend` (React App):**
    
    - **Imagen:** Construcción multi-stage (Build -> Serve). Para desarrollo local, `node:20-alpine` ejecutando `npm run dev` con volúmenes de código. Para producción "casera", `nginx:alpine` sirviendo los estáticos.
        
    - **Puertos:** **Único puerto expuesto** (ej. `80:80` o `3000:3000`) hacia el host.
        
    - **Proxy:** Configuración de Vite/Nginx para redirigir peticiones `/api` hacia el servicio `backend:4000`, evitando problemas de CORS y manteniendo la arquitectura de "un solo puerto".
        

### 2.3.2 Configuración de Red

Se definirá una red llamada `sacc-network`.

- Todos los servicios se unen a esta red.
    
- El nombre del servicio en el `docker-compose` actuará como hostname (ej. la cadena de conexión a BD será `postgres://user:pass@db:5432/sacc`).
    

## 2.4 Seguridad y Variables de Entorno

La configuración sensible no se incluirá en el código fuente, sino en un archivo `.env` centralizado que Docker Compose distribuirá a los contenedores correspondientes.

**Variables Críticas (`.env`):**

```
# Configuración General
APP_ENV=production
APP_PORT=3000
PAIS_BASE=MX # México

# Credenciales de Aplicación (Hardcoded Auth)
APP_USER=admin
APP_PASSWORD=secret_secure_password

# Base de Datos
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres_password
DB_NAME=sacc_db

# Inteligencia Artificial
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
DEEPSEEK_MODEL=deepseek-reasoner
```

## 2.5 Requerimientos de Infraestructura

Para ejecutar el sistema, el host (servidor local, VPS o Raspberry Pi) requiere:

- **Docker Engine:** v20.10+.
    
- **Docker Compose:** v2.0+.
    
- **Recursos Mínimos:** 2 vCPU, 2GB RAM (PostgreSQL y Node consumen memoria moderada, React es estático/cliente).
    
- **Espacio en Disco:** ~5GB (Imágenes Docker + Datos de BD).