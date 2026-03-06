# ===== Stage 1: Build =====
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files truoc de cache dependencies layer
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Bien moi truong cho Vite (phai co luc build)
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_API_BASE_URL=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production
RUN npm run build

# ===== Stage 2: Serve voi Nginx =====
FROM nginx:alpine

# Copy static files tu stage build
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx config template (nginx:alpine tu dong xu ly envsubst)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Gia tri mac dinh (tuong thich docker-compose)
# Cloud Run se tu dong set PORT, va BACKEND_URL truyen qua env var
ENV PORT=80
ENV BACKEND_URL=http://backend:8080

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
