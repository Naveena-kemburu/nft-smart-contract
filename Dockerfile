FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Compile contracts
RUN npm run compile

# Set the default command to run tests
CMD ["npm", "test"]
