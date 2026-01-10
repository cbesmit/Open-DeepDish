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
