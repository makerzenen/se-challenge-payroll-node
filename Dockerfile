FROM node:14-alpine AS dev
RUN apk update --no-cache && \
  apk add iputils curl --no-cache
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install --dev --frozen-lockfile
COPY database /app/database
COPY test /app/test
COPY .env index.js knexfile.js logger.js queries.js routes.js /app/
RUN chown -R node:node /app
RUN chmod +x /app/database/scripts/reset.js
ENV PATH /app/node_modules/.bin:$PATH
USER node
CMD ["node", "index.js"]

FROM node:14-alpine AS release
RUN apk update --no-cache
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install --production --frozen-lockfile
COPY index.js knexfile.js logger.js queries.js routes.js /app/
RUN chown -R node:node /app
ENV PATH /app/node_modules/.bin:$PATH
USER node
CMD ["node", "index.js"]
