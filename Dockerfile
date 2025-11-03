# ======================
# Step 1: Build stage
# ======================
FROM node:18-alpine AS builder

# Use a dedicated user for better security
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Build-time public environment variables (provided via --build-arg)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Copy only the package files first (better caching)
COPY package*.json ./

# Install dependencies using clean cache
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the application
RUN npm run build

# ======================
# Step 2: Production stage
# ======================
FROM node:18-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Use the same non-root user as builder
RUN addgroup -S app && adduser -S app -G app

# Copy only necessary output files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./

# Install only production dependencies efficiently
RUN npm ci --omit=dev && npm cache clean --force

# Change ownership for safety
USER app

EXPOSE 3000
CMD ["npm", "run", "start"]
