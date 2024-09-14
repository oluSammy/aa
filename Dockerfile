FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json .
COPY .env .

RUN npm install
# RUN npm rebuild bcrypt --build-from-source


COPY . .

RUN ls

RUN npm run build

#Production stage
FROM node:20-alpine AS production

ARG port
ENV port $port

WORKDIR /app

COPY package*.json .

RUN npm ci --only=production

COPY --from=build /app/dist ./dist
# COPY --from=build /app/.env ./.env

CMD ["node", "dist/src/index.js"]