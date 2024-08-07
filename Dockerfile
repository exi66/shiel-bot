FROM node:latest

RUN mkdir -p /home/node/app/node_modules && chown -R /home/node/app

WORKDIR /home/node/app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run vite:build

RUN npm rebuild sqlite3

# RUN npm run migrate

EXPOSE 3003

CMD npm run start