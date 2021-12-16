FROM node:8.11.0-alpine

# Create app directory
RUN mkdir -p /api/project
WORKDIR /api/project

# Install app dependencies
COPY package.json /api/project
RUN npm install

# Copy app source
RUN mkdir -p /api/project/logs
COPY ./config /api/project/config
COPY ./db /api/project/db
COPY ./middlewares /api/project/middlewares
COPY ./logger /api/project/logger
COPY ./router /api/project/router
COPY ./service /api/project/service
COPY ./sqlTemplate /api/project/sqlTemplate
COPY ./utils /api/project/utils
COPY ./validator /api/project/validator
COPY ./app.js /api/project

EXPOSE 5999

CMD [ "npm", "run", "start" ]