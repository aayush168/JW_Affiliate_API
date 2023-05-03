FROM --platform=linux/amd64 node:8.11.0-alpine

# Create app directory
RUN mkdir -p /api/project
WORKDIR /api/project

# Install app dependencies
COPY package*.json /api/project/
RUN npm install

# Copy app source
RUN mkdir -p /api/project/logs
COPY ./config /api/project/config
COPY ./credentials /api/project/credentials
COPY ./controller /api/project/controller
COPY ./dataAPI /api/project/dataAPI
COPY ./db /api/project/db
COPY ./logger /api/project/logger
COPY ./middlewares /api/project/middlewares
COPY ./router /api/project/router
COPY ./service /api/project/service
COPY ./sqlTemplate /api/project/sqlTemplate
COPY ./utils /api/project/utils
COPY ./system /api/project/system
COPY ./validator /api/project/validator
COPY ./ocms /api/project/ocms
COPY ./app.js /api/project

EXPOSE 5999

CMD [ "npm", "run", "start" ]