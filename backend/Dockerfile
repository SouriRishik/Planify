FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install devDependencies so we can build TypeScript
RUN npm install

# Copy source and build
COPY . ./
RUN npm run build

# Remove dev dependencies to slim image
RUN npm prune --production

ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
