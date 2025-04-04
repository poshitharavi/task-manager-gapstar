# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend application code
COPY . .

# Build the React application using Vite
RUN npm run build

# Use a lightweight Nginx server to serve the static files
FROM nginx:stable-alpine

# Copy the built React application to Nginx's web server directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the frontend application
EXPOSE 80

# Optionally, you can include a custom nginx.conf if needed
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf