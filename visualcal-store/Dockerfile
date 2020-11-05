FROM node:latest

WORKDIR /visualcal

RUN npm install -g typescript

COPY ./common common

WORKDIR /visualcal/app

COPY ./visualcal-store/package.json .
RUN npm install

ADD ./visualcal-store .

RUN npm run build

CMD [ "node", "dist/index.js" ]
EXPOSE 80
