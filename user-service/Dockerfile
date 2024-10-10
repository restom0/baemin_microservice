# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /root/app
COPY package*.json yarn*.lock ./
RUN yarn config set network-timeout 3000000 && yarn install
COPY ./src/prisma ./src/prisma/
RUN yarn prisma generate --schema ./src/prisma/schema.prisma
COPY . .
RUN yarn run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /root/app
COPY --from=builder /root/app/dist ./dist
COPY --from=builder /root/app/node_modules ./node_modules
COPY --from=builder /root/app/package*.json ./
EXPOSE 8080
CMD ["yarn", "run", "start:prod"]
