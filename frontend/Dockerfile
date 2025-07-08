# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
# Use --force to avoid potential dependency tree issues with create-react-app
RUN npm install --force

# Copy the rest of the frontend source code
COPY . .

# Your app runs on port 3000, so expose it
EXPOSE 3000

# Helps with hot-reloading in some container environments
ENV CHOKIDAR_USEPOLLING=true

# Define the command to run your app
CMD ["npm", "start"]