FROM node:latest

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json .

USER node

RUN npm install

COPY --chown=node:node . .

COPY --chown=node:node ./../files .

RUN npm run vite:build

RUN npm rebuild sqlite3

EXPOSE 3003

CMD node app/index.js