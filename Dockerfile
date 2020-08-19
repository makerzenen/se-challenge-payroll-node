FROM node:14-alpine AS dev
RUN apk update --no-cache
COPY database /app/database
COPY package.json index.js knexfile.js /app/
WORKDIR /app
RUN yarn install --dev --frozen-lockfile
RUN chown -R node:node /app
USER node
CMD ["node", "index.js"]

FROM node:14-alpine AS release
RUN apk update --no-cache
COPY package.json index.js knexfile.js /app/
WORKDIR /app
RUN yarn install --production --frozen-lockfile
RUN chown -R node:node /app
USER node
CMD ["node", "index.js"]
