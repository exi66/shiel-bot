FROM node:latest

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json .

USER node

RUN npm install

COPY --chown=node:node . .

RUN npm run vite:build

RUN npm rebuild sqlite3

# RUN npm run migrate

EXPOSE 3003

CMD npm run start