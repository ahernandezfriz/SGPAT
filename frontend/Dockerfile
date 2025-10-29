# frontend/Dockerfile

# --- Etapa 1: Construcción (Build Stage) ---
# Usamos 18-alpine (la versión 3.18 solo era necesaria para el backend)
FROM node:18-alpine AS build-stage
WORKDIR /app

# 1. Copiar SÓLO los package.json
COPY package.json package-lock.json ./

# 2. Instalar dependencias
# Esto crea /app/node_modules DENTRO del contenedor
RUN npm install

# 3. Copiar selectivamente SÓLO lo necesario para el build
# ESTO REEMPLAZA EL 'COPY . .' Y SOLUCIONA EL ERROR
COPY ./index.html ./
COPY ./vite.config.js ./
COPY ./tailwind.config.js ./
COPY ./postcss.config.js ./
COPY ./src ./src
# Fin del reemplazo

# 4. Construir la app
RUN npm run build

# --- Etapa 2: Servidor (Serve Stage) ---
# (Esta etapa queda exactamente igual)
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]