# Use the official Node.js image as the base image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 9000

# Start the backend application
CMD ["nodemon", "index.js"]
