FROM node:alpine

RUN mkdir -p /root/app/node_modules

WORKDIR /root/app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run vite:build
RUN npm rebuild sqlite3

# RUN npm run migrate

EXPOSE 3003

CMD npm run start