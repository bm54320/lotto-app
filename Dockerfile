FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build || true
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]

