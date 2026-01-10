FROM node:20-alpine

WORKDIR /app

# Instalar OpenSSL para Prisma
RUN apk add --no-cache openssl

# Instalar dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente (y prisma schema si aplica)
COPY . .

# Generar cliente de Prisma (si se usa)
RUN npx prisma generate

# El puerto 4000 es interno, no se expone al host, solo a la red Docker
EXPOSE 4000

CMD ["npm", "start"]
