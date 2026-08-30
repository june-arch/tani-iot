FROM node:22-alpine AS base
WORKDIR /app

# deps
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# source
COPY . .

# prisma - pin to v6 to avoid Prisma 7 breaking schema (url env) and node 20 EBADENGINE
RUN ./node_modules/.bin/prisma generate

# build
RUN npm run build

EXPOSE 3101
CMD ["node", "dist/main.js"]
