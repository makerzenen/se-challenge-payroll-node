FROM node:14-alpine AS dev
RUN apk update --no-cache
WORKDIR /app
COPY package.json /app
RUN yarn install --dev --frozen-lockfile
COPY database /app/database
COPY test /app/test
COPY yarn.lock index.js knexfile.js logger.js queries.js routes.js /app/
RUN chown -R node:node /app
ENV PATH /app/node_modules/.bin:$PATH
USER node
CMD ["node", "index.js"]

FROM node:14-alpine AS release
RUN apk update --no-cache
WORKDIR /app
COPY package.json /app
RUN yarn install --production --frozen-lockfile
COPY yarn.lock index.js knexfile.js logger.js queries.js routes.js /app/
RUN chown -R node:node /app
ENV PATH /app/node_modules/.bin:$PATH
USER node
CMD ["node", "index.js"]
