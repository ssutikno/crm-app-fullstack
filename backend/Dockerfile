# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Your app binds to port 5000, so expose it
EXPOSE 5000

# Define the command to run your app
#CMD ["node", "server.js"]
CMD [ "npm", "run", "dev" ]