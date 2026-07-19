FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json /app

RUN npm install

COPY . .

EXPOSE 5000

CMD [ "npm", "run", "start:dev" ]
