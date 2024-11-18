# Use a smaller base image
FROM node:23-alpine AS builder

# Set working directory
WORKDIR /root/app

# Copy package.json and yarn.lock before other files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn config set network-timeout 3000000 && yarn install

# Copy the source code
COPY . .

# Build the application
RUN yarn run build

# Use a smaller image for production
FROM node:23-alpine

# Set working directory
WORKDIR /root/app

# Copy only necessary files from the builder stage
COPY --from=builder /root/app/dist ./dist
COPY --from=builder /root/app/node_modules ./node_modules
COPY --from=builder /root/app/package*.json ./

# Expose the application port
EXPOSE 8080

# Command to run the application
CMD ["yarn", "run", "start:prod"]
