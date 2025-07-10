# ---- Base Node image ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Install dependencies ----
COPY package.json package-lock.json* ./
RUN npm ci --production

# ---- Build Next.js application ----
COPY . .
RUN npm run build

# ---- Release image ----
FROM node:20-alpine AS release
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app /app

EXPOSE 3000
CMD ["npm", "start"]