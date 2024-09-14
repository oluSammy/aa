FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json .

RUN npm install
# RUN npm rebuild bcrypt --build-from-source


COPY . .

RUN npm run build

#Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json .

RUN npm ci --only=production

COPY --from=build /app/dist ./dist

CMD ["node", "dist/src/index.js"]