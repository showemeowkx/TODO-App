# --- build ---
FROM node:22-alpine AS build

WORKDIR /app

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
