# backend/Dockerfile

# --- Etapa 1: Construcción (Build Stage) ---
# Usamos la versión 3.18 de Alpine
FROM node:18-alpine3.18 AS builder 
WORKDIR /app

# Copiamos primero los 'package.json'
COPY package.json package-lock.json ./

# ----> ¡AQUÍ ESTÁ LA CORRECCIÓN! <----
# Copiamos la carpeta de Prisma ANTES de instalar
# para que 'prisma generate' (postinstall) funcione.
COPY ./prisma ./prisma

# 2. Instalar dependencias
# Ahora 'npm install' verá el schema y generará el cliente.
RUN npm install

# 3. Copiar el resto del código
COPY . .

# --- Etapa 2: Producción (Production Stage) ---
# (Esta etapa queda exactamente igual)
FROM node:18-alpine3.18

RUN apk update && apk add openssl1.1-compat

WORKDIR /app

# Copiamos las dependencias (que ahora SÍ incluyen el cliente de Prisma generado)
COPY --from=builder /app/node_modules ./node_modules
# Copiamos el código de la app
COPY --from=builder /app .

EXPOSE 4000
CMD ["npm", "start"]