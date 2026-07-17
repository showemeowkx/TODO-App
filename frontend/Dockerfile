# --- build ---
FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_BASE_API_URL=http://localhost:3000
ARG VITE_FRONTEND_PORT=5173
ENV VITE_BASE_API_URL=$VITE_BASE_API_URL
ENV VITE_FRONTEND_PORT=$VITE_FRONTEND_PORT

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# --- run ---
FROM node:22-alpine AS run

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY vite.config.ts index.html ./
COPY --from=build /app/dist ./dist

ENV PORT=5173

EXPOSE 5173

CMD ["sh", "-c", "npx vite preview --host 0.0.0.0 --port ${PORT}"]
