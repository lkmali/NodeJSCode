# Check out https://hub.docker.com/_/node to select a new base image
FROM mhart/alpine-node:latest as  LAXMAN_BUILD_IMAGE


WORKDIR /usr/src/app

COPY . .


RUN yarn install --ignore-engines

RUN yarn build

FROM mhart/alpine-node:latest

# RUN addgroup -g 1000 node \
#     && adduser -u 1000 -G node -s /bin/sh -D node \
#     && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Set to a non-root built-in user `node`
##USER node

WORKDIR /usr/src/app

COPY    --from=LAXMAN_BUILD_IMAGE /usr/src/app/package.json /usr/src/app/package.json
COPY  --from=LAXMAN_BUILD_IMAGE /usr/src/app/pm2.json /usr/src/app/pm2.json
COPY  --from=LAXMAN_BUILD_IMAGE /usr/src/app/node_modules /usr/src/app/node_modules
COPY  --from=LAXMAN_BUILD_IMAGE /usr/src/app/dist /usr/src/app/dist

# Start Server
ENTRYPOINT ./node_modules/.bin/pm2-runtime start ./pm2.json --env $NODE_ENV

EXPOSE ${PORT}
