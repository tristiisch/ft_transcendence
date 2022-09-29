FROM node:18-alpine As dev

WORKDIR /usr/src/app

RUN mkdir -p node_modules/.vite/processing && chmod -R 777 node_modules/.vite/processing
RUN chown -R node:node .

COPY --chown=node:node package*.json ./

COPY --chown=node:node . .
RUN mkdir -p dist/assets node_modules

USER node

RUN npm ci



FROM node:18-alpine As prod

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=dev /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

USER node

CMD [ "npm", "run", "prod" ]
