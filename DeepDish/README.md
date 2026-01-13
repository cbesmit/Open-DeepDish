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

## Ejecución (Docker Compose)

La forma más sencilla de levantar el proyecto es utilizando Docker Compose.

1.  **Levantar los servicios:**
    ```bash
    docker-compose up --build
    ```
    Este comando construirá las imágenes del backend y frontend, y levantará la base de datos.
    
    - El **Frontend** estará disponible en: `http://localhost:3000` (o el puerto que hayas definido en `APP_PORT`).
    - El **Backend** estará disponible internamente en el puerto 4000.

2.  **Detener los servicios:**
    ```bash
    docker-compose down
    ```

## Estructura del Proyecto

- `/backend`: API RESTful con Express y Prisma.
- `/frontend`: Aplicación SPA con React y Vite.
- `/postgres_data`: Persistencia de datos de PostgreSQL (se crea automáticamente).
- `docker-compose.yml`: Orquestación de contenedores.
