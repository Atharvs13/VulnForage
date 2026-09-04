FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist/src ./dist
RUN mkdir -p data/uploads data/lab-uploads
EXPOSE 4000
CMD ["node", "dist/server.js"]
