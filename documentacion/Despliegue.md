# 8. Guía de Despliegue y Ejecución

Esta sección detalla cómo orquestar la infraestructura utilizando Docker. Se implementa un patrón de **Proxy Inverso** dentro del contenedor del Frontend para cumplir con el requerimiento de exponer un único puerto y centralizar la comunicación.

## 8.1 Estructura del Proyecto

Se recomienda la siguiente organización de carpetas para mantener el contexto de Docker limpio:

```
/sacc-project
├── /backend            # Código fuente Node.js
│   ├── Dockerfile      # Instrucciones de construcción del Backend
│   ├── package.json
│   └── src/
├── /frontend           # Código fuente ReactJS
│   ├── Dockerfile      # Instrucciones Multi-stage (Build -> Nginx)
│   ├── nginx.conf      # Configuración del Proxy Inverso
│   ├── package.json
│   └── src/
├── docker-compose.yml  # Orquestador
└── .env                # Variables de entorno (No subir a Git)
```

## 8.2 Configuración de Contenedores

### 8.2.1 Backend (Node.js)

Archivo: `/backend/Dockerfile`

Utilizamos una imagen ligera de Alpine.

```
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente (y prisma schema si aplica)
COPY . .

# Generar cliente de Prisma (si se usa)
# RUN npx prisma generate

# El puerto 4000 es interno, no se expone al host, solo a la red Docker
EXPOSE 4000

CMD ["npm", "start"]
```

### 8.2.2 Frontend + Proxy (React + Nginx)

Archivo: `/frontend/Dockerfile`

Usamos **Multi-stage build**: primero compilamos React a estáticos HTML/JS, y luego los servimos con Nginx.

```
# Etapa 1: Build
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: Servidor Producción & Proxy
FROM nginx:alpine
# Copiar el build de React a la carpeta de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 8.2.3 Configuración Nginx (La clave del puerto único)

Archivo: `/frontend/nginx.conf`

Este archivo hace la magia: sirve el Frontend y redirige las llamadas `/api` al contenedor del backend **internamente**.

```
server {
    listen 80;

    # 1. Servir la aplicación React
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html; # Necesario para React Router
    }

    # 2. Redirigir llamadas API al Backend (Proxy Inverso)
    location /api/ {
        # 'backend' es el nombre del servicio en docker-compose
        proxy_pass http://backend:4000/api/; 
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 8.3 Orquestación (Docker Compose)

Archivo: `docker-compose.yml`

Define los servicios, redes y volúmenes persistentes.

```
version: '3.8'

services:
  # --- Base de Datos ---
  db:
    image: postgres:15-alpine
    container_name: sacc_db
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - sacc-network
    # No exponemos puerto 5432 al host por seguridad

  # --- Backend (API & IA Controller) ---
  backend:
    build: ./backend
    container_name: sacc_backend
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 4000
      DATABASE_URL: postgres://${DB_USER}:${DB_PASS}@db:5432/${DB_NAME}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      APP_USER: ${APP_USER}
      APP_PASSWORD: ${APP_PASSWORD}
    networks:
      - sacc-network
    # Healthcheck opcional para asegurar que DB está lista antes de arrancar
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -h db -U ${DB_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  # --- Frontend (Web Server & Gateway) ---
  frontend:
    build: ./frontend
    container_name: sacc_frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "${APP_PORT}:80" # El ÚNICO puerto expuesto (ej. 3000 -> 80)
    networks:
      - sacc-network

networks:
  sacc-network:
    driver: bridge

volumes:
  postgres_data:
```

## 8.4 Variables de Entorno

Archivo: `.env`

```
# App Config
APP_PORT=3000
APP_USER=admin
APP_PASSWORD=miclavesegura

# Base de Datos
DB_USER=postgres
DB_PASS=postgres_password
DB_NAME=sacc_db

# Inteligencia Artificial
OPENAI_API_KEY=sk-tuapikeyopenai
```

## 8.5 Instrucciones de Ejecución

### 8.5.1 Primer Despliegue

1. **Crear archivos:** Asegúrate de tener la estructura de carpetas y los archivos arriba mencionados.
    
2. **Construir y levantar:**
    
    ```
    docker-compose up -d --build
    ```
    
3. Inicializar Base de Datos:
    
    Como usamos Docker, necesitamos ejecutar la migración inicial dentro del contenedor del backend (asumiendo que usas Prisma):
    
    ```
    docker exec -it sacc_backend npx prisma migrate deploy
    ```
    
    _O si usas scripts SQL planos:_
    
    ```
    cat init.sql | docker exec -i sacc_db psql -U postgres -d sacc_db
    ```
    

### 8.5.2 Acceso

- Abre tu navegador y ve a: `http://localhost:3000`
    
- Verás la aplicación React.
    
- Cualquier petición que React haga a `/api/...` será redirigida automáticamente por Nginx al Backend.
    

### 8.5.3 Actualizaciones

Para actualizar el código después de cambios:

```
docker-compose up -d --build
```

Esto reconstruirá las imágenes y recreará solo los contenedores necesarios sin perder los datos de la base de datos (gracias al volumen `postgres_data`).