FROM node:16

WORKDIR /search-engne-API

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . ./

ARG passwd
ENV MONGODB_PSSWD $passwd

CMD [ "node", "app.js" ]

EXPOSE 8000