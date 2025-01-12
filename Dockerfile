FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy application files
COPY . .

# Install dependencies
RUN pnpm install

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start:dev"]
