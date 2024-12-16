FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Production stage
FROM node:20-slim AS production

ENV NODE_ENV production
WORKDIR /app

COPY package*.json /app
RUN npm i --production

COPY --from=build /app/dist /app/dist
COPY public /app/public

EXPOSE 8080

# Start the application (assuming you run the compiled JS)
CMD ["node", "dist/index.js"]
