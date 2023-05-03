FROM node:16.20

RUN apt update

WORKDIR /modeler

COPY ./package*.json .

RUN npm ci

RUN npm cache clean --force
