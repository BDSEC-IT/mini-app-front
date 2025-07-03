# Step 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./

# Install only production dependencies, which is much faster
RUN npm install --production

EXPOSE 3000
CMD ["npm", "run", "start"]