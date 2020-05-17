FROM node:10.14.1-alpine

WORKDIR /usr/local/

COPY package*.json .nvmrc /usr/local/

RUN npm install

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.2/wait /wait

COPY . .

EXPOSE 8080

RUN chmod +x /wait

