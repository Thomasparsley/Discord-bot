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

ARG ARG_DISCORD_CLIENT_ID
ARG ARG_DISCORD_GUILD_ID
ARG ARG_DISCORD_TOKEN

ENV DISCORD_CLIENT_ID=$ARG_DISCORD_CLIENT_ID
ENV DISCORD_GUILD_ID=$ARG_DISCORD_GUILD_ID
ENV DISCORD_TOKEN=$ARG_DISCORD_TOKEN

CMD [ "node", "/app/dist/index.js" ]
