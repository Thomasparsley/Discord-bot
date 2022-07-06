# Build stage
FROM node:lts-alpine AS BuildStage

RUN mkdir /app
WORKDIR /app

COPY . /app

RUN npm install

RUN npm run build



# Run stage
FROM node:lts-alpine

RUN mkdir /app
WORKDIR /app

COPY --from=BuildStage /app /app

RUN npm install --production

CMD [ "node", "/app/index.js" ]
