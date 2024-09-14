FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json .
COPY .env .

RUN cat .env

RUN npm install
# RUN npm rebuild bcrypt --build-from-source


COPY . .

RUN ls -a

RUN npm run build

#Production stage
FROM node:20-alpine AS production

ARG port
ENV port $port

WORKDIR /app

COPY package*.json .

RUN apk add --no-cache bash
RUN wget -O /bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x /bin/wait-for-it.sh

RUN npm ci --only=production

COPY --from=build /app/dist ./dist
# COPY --from=build /app/.env ./.env

CMD ["node", "dist/src/index.js"]