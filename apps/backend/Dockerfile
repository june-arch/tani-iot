FROM node:20-alpine AS base
WORKDIR /app

# deps
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# source
COPY . .

# prisma
RUN npx prisma generate

# build
RUN npm run build

EXPOSE 3101
CMD ["node", "dist/main.js"]
