# DeepDish

DeepDish es una aplicación para la generación y gestión de recetas de cocina, impulsada por inteligencia artificial.

## Stack Tecnológico

- **Frontend:** React, Vite, Tailwind CSS, Zustand
- **Backend:** Node.js, Express, Prisma ORM
- **Base de Datos:** PostgreSQL
- **IA:** OpenAI API

## Requisitos Previos

- Docker y Docker Compose instalados en tu sistema.
- Una API Key de OpenAI (para la generación de recetas).

## Configuración

1.  **Clonar el repositorio** (si no lo has hecho aún):
    ```bash
    git clone <url-del-repositorio>
    cd DeepDish
    ```

2.  **Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto (al mismo nivel que `docker-compose.yml`). Puedes usar el siguiente ejemplo:

    ```env
    # Configuración de Base de Datos
    DB_USER=postgres
    DB_PASS=tu_password_secreto
    DB_NAME=deepdish_db

    # Configuración del Backend
    OPENAI_API_KEY=tu_api_key_de_openai

    # Configuración del Frontend
    APP_PORT=3000
    ```

## Entornos de Ejecución

El proyecto está configurado para ejecutarse en dos modos diferentes:

### 1. Entorno de Desarrollo (Local)
Ideal para programar. Incluye "Hot Reload" (los cambios en el código se reflejan inmediatamente) y logs detallados.

```bash
docker compose up
```

- **Frontend:** Usa Vite Dev Server (puerto `APP_PORT` mapeado al 5173 interno).
- **Backend:** Usa Nodemon para reinicio automático.
- **Volúmenes:** El código local está sincronizado con el contenedor.

### 2. Entorno de Producción (VPS / Servidor)
Optimizado para rendimiento y seguridad. Usa Nginx para servir el frontend compilado y el backend en modo producción.

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- **Frontend:** Archivos estáticos optimizados servidos por Nginx interno.
- **Backend:** Ejecución optimizada sin watchers innecesarios.
- **Nota:** No incluye "Hot Reload". Cualquier cambio requiere reconstruir los contenedores con `--build`.
- **Puerto:** La aplicación completa se sirve en el puerto definido en `APP_PORT`.

## Comandos Útiles

- **Detener servicios:**
  ```bash
  docker compose down
  # O si usaste producción:
  docker compose -f docker-compose.prod.yml down
  ```

## Estructura del Proyecto

- `/backend`: API RESTful con Express y Prisma.
- `/frontend`: Aplicación SPA con React y Vite.
- `/postgres_data`: Persistencia de datos de PostgreSQL (se crea automáticamente).
- `docker-compose.yml`: Orquestación de contenedores.
