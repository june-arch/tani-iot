FROM node:22-alpine AS base
WORKDIR /app

# deps - include dev deps (prisma is devDependency)
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps --include=dev

# source
COPY . .

# prisma - pin to v6 to avoid Prisma 7 breaking schema
RUN npx prisma@6.19.3 generate

# build
RUN npm run build

EXPOSE 3101
CMD ["node", "dist/src/main.js"]
