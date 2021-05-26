FROM node:12-alpine

WORKDIR /usr/src

COPY package*.json ./

RUN npm install && npm cache clean --force

ENV PATH=/usr/src/node_modules/.bin:$PATH

WORKDIR /usr/src/app

COPY ./ ./

CMD ["npm","start"]