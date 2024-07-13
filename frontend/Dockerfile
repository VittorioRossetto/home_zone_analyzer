FROM node:14.15.4

# Set the working directory.
WORKDIR /app

# Copy the package.json file.
COPY package*.json .

# Install application dependencies.
RUN npm install

# Copy the rest of the application files.
COPY . .

# Expose the port.
EXPOSE 3000

# Run the application.
CMD ["npm", "start"]
