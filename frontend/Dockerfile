# syntax=docker/dockerfile:1

# Use an official Node.js runtime as the base image
FROM node:alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Copy the rest of the application code to the container
COPY . .

# Install dependencies
RUN npm install

# Build the React app
#RUN npm run build

# Set the command to run the production build of the React app
CMD ["npm", "start"]