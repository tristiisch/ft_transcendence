###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:18-alpine As dev

# Install vue.js
# RUN npm install -g @vue/cli

# Create app directory
WORKDIR /usr/src/app

RUN mkdir -p node_modules/.vite/processing && chmod -R 777 node_modules/.vite/processing
RUN chown -R node:node .

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package*.json ./

# Bundle app source
COPY --chown=node:node . .
RUN mkdir -p dist/assets node_modules
RUN chown -R node:node .

RUN env | grep VITE_ | while read -r var ; do VAR_ARRAY=${var//=/ }; echo $var >> .env ; done

# Use the node user from the image (instead of the root user)
USER node

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN npm ci

###################
# PRODUCTION
###################

FROM node:18-alpine As prod

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

# In order to run `npm run build` we need access to the Nest CLI.
# The Nest CLI is a dev dependency,
# In the previous development stage we ran `npm ci` which installed all dependencies.
# So we can copy over the node_modules directory from the development image into this build image.
COPY --chown=node:node --from=dev /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .


# Run the build command which creates the production bundle
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory.
# Passing in --omit=dev ensures that only the production dependencies are installed.
# This ensures that the node_modules directory is as optimized as possible.
#RUN npm ci --omit=dev && npm cache clean --force

USER node

CMD [ "npm", "run", "prod" ]
