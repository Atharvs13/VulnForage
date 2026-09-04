FROM node:24-alpine AS build
WORKDIR /app
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json tsconfig*.json vite.config.ts postcss.config.js tailwind.config.js index.html ./
COPY src ./src
RUN npm install && npm run build

FROM node:24-alpine
WORKDIR /app
RUN npm install -g serve@14
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
